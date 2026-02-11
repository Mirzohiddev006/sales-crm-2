import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
}

export function ErrorState({ 
  title = "Xatolik yuz berdi", 
  message, 
  retry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
      </Alert>
      {retry && (
        <Button onClick={retry} variant="outline" className="mt-4">
          Qayta urinish
        </Button>
      )}
    </div>
  )
}
