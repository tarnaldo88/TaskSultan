import React from 'react'
import { useAuth } from '../../store/authContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Button } from '../ui/button'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerSchema = loginSchema.extend({
  name: z.string().min(2)
})

type LoginInput = z.infer<typeof loginSchema>
type RegisterInput = z.infer<typeof registerSchema>

function AuthForm() {
  const { login, register, isLoading, error, user } = useAuth()
  const [tab, setTab] = React.useState<'login' | 'register'>('login')

  const loginForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function handleLogin(data: LoginInput) {
    await login(data)
  }
  async function handleRegister(data: RegisterInput) {
    await register(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            {tab === 'login' ? 'Sign In' : 'Register'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={v => setTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  {...loginForm.register('email')}
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  {...loginForm.register('password')}
                  disabled={isLoading}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                {loginForm.formState.errors.email && (
                  <div className="text-red-500 text-xs">{loginForm.formState.errors.email.message}</div>
                )}
                {loginForm.formState.errors.password && (
                  <div className="text-red-500 text-xs">{loginForm.formState.errors.password.message}</div>
                )}
                {error && <div className="text-red-500 text-xs text-center">{error}</div>}
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <Input
                  placeholder="Name"
                  {...registerForm.register('name')}
                  disabled={isLoading}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  {...registerForm.register('email')}
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  {...registerForm.register('password')}
                  disabled={isLoading}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
                {registerForm.formState.errors.name && (
                  <div className="text-red-500 text-xs">{registerForm.formState.errors.name.message}</div>
                )}
                {registerForm.formState.errors.email && (
                  <div className="text-red-500 text-xs">{registerForm.formState.errors.email.message}</div>
                )}
                {registerForm.formState.errors.password && (
                  <div className="text-red-500 text-xs">{registerForm.formState.errors.password.message}</div>
                )}
                {error && <div className="text-red-500 text-xs text-center">{error}</div>}
              </form>
            </TabsContent>
          </Tabs>
          {user && <div className="text-green-600 text-center mt-4">Welcome, {user.name}</div>}
        </CardContent>
      </Card>
    </div>
  )
}

export { AuthForm }
