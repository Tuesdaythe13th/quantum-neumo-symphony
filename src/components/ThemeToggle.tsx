
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button 
      onClick={toggleTheme}
      variant="outline" 
      size="icon" 
      className="rounded-full w-10 h-10 border-quantum-muted/30 fixed top-4 right-4 z-10 bg-black/10 backdrop-blur-md"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-white/90" />
      ) : (
        <Moon className="h-5 w-5 text-black/90" />
      )}
    </Button>
  );
};

export default ThemeToggle;
