export function updateContentLayout(value: "centered" | "full-width") {
  if (typeof document === 'undefined') return;
  
  const target = document.querySelector('[data-slot="sidebar-inset"]');
  if (target) {
    target.setAttribute("data-content-layout", value);
  }
}
