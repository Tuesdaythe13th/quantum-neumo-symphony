import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-background text-foreground border-border shadow-lg dark:bg-neutral-900 dark:text-neutral-50 dark:border-neutral-700",
          description: "group-[.toast]:text-muted-foreground dark:text-neutral-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground dark:bg-primary dark:text-primary-foreground", // Assuming primary is already dark-theme aware
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground dark:bg-neutral-700 dark:text-neutral-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
