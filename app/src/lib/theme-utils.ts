export function updateThemeMode(value: "light" | "dark") {
  if (typeof document === 'undefined') return;
  
  const doc = document.documentElement;
  doc.classList.add("disable-transitions");
  doc.classList.toggle("dark", value === "dark");
  requestAnimationFrame(() => {
    doc.classList.remove("disable-transitions");
  });
}

export function updateThemePreset(value: string) {
  if (typeof document === 'undefined') return;
  
  document.documentElement.setAttribute("data-theme-preset", value);
}
