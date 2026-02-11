import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { 
  LayoutDashboard, 
  Loader2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Code2 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/services/authService"

const loginSchema = z.object({
  username: z.string().min(1, "Username kiritish majburiy"),
  password: z.string().min(1, "Parol kiritish majburiy"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      const response = await authService.login(data)
      
      localStorage.setItem("access_token", response.access_token)
      localStorage.setItem("refresh_token", response.refresh_token)
      localStorage.setItem("user_role", response.user.role)
      localStorage.setItem("user_id", response.user.id.toString())
      
      toast.success(`Xush kelibsiz, ${response.user.username}!`)
      navigate("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.detail || "Login yoki parolda xatolik bor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
      <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-blue-500/10 opacity-20 blur-[100px]" />

      <Card className="w-full max-w-[400px] relative z-10 border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-primary/5">
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <div className="flex justify-center mb-2">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-blue-600 opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
              <div className="relative p-3 bg-background rounded-xl border border-border shadow-sm">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Xush kelibsiz
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            365 Magazine boshqaruv paneliga kiring
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1"
              >
                Username
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-2.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  disabled={isLoading}
                  className="pl-10 h-10 bg-background/50 border-input/60 focus:border-primary/50 focus:bg-background transition-all"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive font-medium ml-1 animate-in slide-in-from-left-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1"
                >
                  Parol
                </Label>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-2.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="pl-10 pr-10 h-10 bg-background/50 border-input/60 focus:border-primary/50 focus:bg-background transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground/50 hover:text-foreground transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium ml-1 animate-in slide-in-from-left-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-2 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                <>
                  Kirish <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <div className="p-6 pt-0 text-center">
          <p className="text-xs text-muted-foreground/50">
            &copy; 2026 365 Magazine System
          </p>
        </div>
      </Card>

      {/* Powered by Cognilabs */}
      <div className="absolute bottom-6 w-full text-center z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <a
          href="https://www.cognilabs.org/uz"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-all duration-300"
        >
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            Powered by
          </span>
          <div className="flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all">
              Cognilabs
            </span>
          </div>
        </a>
      </div>
    </div>
  )
}
