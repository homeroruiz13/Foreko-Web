-- =========================
-- ORG FUNCTIONS AND TRIGGERS
-- =========================

-- Create ENUM types first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE org.user_role AS ENUM ('owner', 'admin', 'member');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_role') THEN
        CREATE TYPE org.invitation_role AS ENUM ('admin', 'member');
    END IF;
END $$;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION org.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW IS DISTINCT FROM OLD AND NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at) THEN
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure company owner function
CREATE OR REPLACE FUNCTION org.ensure_company_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- If deleting or changing role from owner, ensure another owner exists
    IF (TG_OP = 'DELETE' AND OLD.role = 'owner') OR 
       (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') THEN
        
        IF NOT EXISTS (
            SELECT 1 FROM org.user_companies 
            WHERE company_id = COALESCE(NEW.company_id, OLD.company_id) 
            AND role = 'owner' 
            AND id != OLD.id
        ) THEN
            RAISE EXCEPTION 'Cannot remove last owner from company. Assign another owner first.';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- User access check function
CREATE OR REPLACE FUNCTION org.user_has_company_access(
    p_user_id UUID,
    p_company_id UUID,
    p_required_role org.user_role DEFAULT 'member'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role org.user_role;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    -- Get user's role in the company
    SELECT role INTO user_role
    FROM org.user_companies
    WHERE user_id = p_user_id AND company_id = p_company_id;
    
    -- If user is not a member, return false
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Define role hierarchy (higher number = more permissions)
    role_hierarchy := CASE user_role
        WHEN 'owner' THEN 3
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 1
    END;
    
    required_hierarchy := CASE p_required_role
        WHEN 'owner' THEN 3
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 1
    END;
    
    RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at') THEN
        CREATE TRIGGER update_companies_updated_at 
        BEFORE UPDATE ON org.companies 
        FOR EACH ROW EXECUTE FUNCTION org.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_companies_updated_at') THEN
        CREATE TRIGGER update_user_companies_updated_at 
        BEFORE UPDATE ON org.user_companies 
        FOR EACH ROW EXECUTE FUNCTION org.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_company_settings_updated_at') THEN
        CREATE TRIGGER update_company_settings_updated_at 
        BEFORE UPDATE ON org.company_settings 
        FOR EACH ROW EXECUTE FUNCTION org.update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_company_owner_trigger') THEN
        CREATE TRIGGER ensure_company_owner_trigger 
        BEFORE UPDATE OR DELETE ON org.user_companies 
        FOR EACH ROW EXECUTE FUNCTION org.ensure_company_owner();
    END IF;
END$$;