import { Upload, Clock, Plus, Rocket, FileSpreadsheet, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DataImportPage() {
  return (
    <div className="@container/main flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-2xl text-center space-y-8">
        {/* Main illustration/icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
              <Database className="w-16 h-16 text-primary/60" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Main heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">No data</h1>
          <p className="text-muted-foreground text-lg">
            Get started by importing your data to create powerful dashboards
          </p>
        </div>

        {/* Action cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">You may need</h2>
          
          <div className="grid gap-4 md:gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg">Import your data</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload Excel, Google Sheets, CSV or connect to your database
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-60">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg">Waiting for data</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Set up your data source and watch your dashboards come to life
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg">Manual data entry</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Start with sample data or enter information manually
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Primary action button */}
        <div className="pt-4">
          <Button size="lg" className="min-w-[200px]">
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Import Data
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-sm text-muted-foreground">
          Need help getting started? Check out our{" "}
          <a href="#" className="text-primary hover:underline">
            data import guide
          </a>
        </p>
      </div>
    </div>
  );
}