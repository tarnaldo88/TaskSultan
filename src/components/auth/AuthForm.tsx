import React from 'react'
import { useAuth } from '../../store/authContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input as InputComponent } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Button } from '../ui/button'

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),
  password: z.string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
})

const registerSchema = loginSchema.extend({
  name: z.string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
})

type LoginInput = z.infer<typeof loginSchema>
type RegisterInput = z.infer<typeof registerSchema>

function AuthForm() {
  const { login, register, isLoading, error, user } = useAuth()
  const [tab, setTab] = React.useState<'login' | 'register'>('login')
  const [registerSuccess, setRegisterSuccess] = React.useState<string | null>(null)

  const loginForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function handleRegister(data: RegisterInput) {
    setRegisterSuccess(null)
    console.log('Register form data:', data)
    try {
      await register(data)
      setRegisterSuccess('Registration successful! You are now signed in.')
    } catch (err) {
      setRegisterSuccess(null)
    }
  }
  async function handleLogin(data: LoginInput) {
    console.log('Login form data:', data)
    await login(data)
  }

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex flex-col">
      {/* Header: Logo/Title left, Register button right */}
      <div className="flex items-center justify-between w-full px-10 py-8">
        <div className="flex items-center gap-4">
          <img
            src="/img/LogoSultan.png"
            alt="TaskSultan Logo"
            className="h-[80px] w-[80px] object-contain drop-shadow-lg"
            draggable="false"
          />
          <span className="text-4xl font-extrabold tracking-tight text-white">TaskSultan</span>
        </div>
        {tab === 'login' && (
          <button
            type="button"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white font-semibold shadow-lg shadow-purple-900/30 transition-all duration-200 border-0 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            onClick={() => setTab('register')}
          >
            Register
          </button>
        )}
      </div>
      {/* Centered Auth Card */}
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl rounded-xl border-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center">
          <CardContent className="w-full flex flex-col items-center justify-center">
            <Tabs value={tab} onValueChange={v => setTab(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800 rounded-lg p-1">
                <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-300">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-300">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-full flex flex-col items-center">
                    <InputComponent
                      type="email"
                      placeholder="Email"
                      {...loginForm.register('email')}
                      disabled={isLoading}
                      className="bg-gray-950 border-gray-800 focus:ring-blue-500 text-white placeholder:text-gray-500 w-full text-center"
                    />
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <InputComponent
                      type="password"
                      placeholder="Password"
                      {...loginForm.register('password')}
                      disabled={isLoading}
                      className="bg-gray-950 border-gray-800 focus:ring-blue-500 text-white placeholder:text-gray-500 w-full text-center"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white font-semibold text-base py-2 rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-200 border-0 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  {loginForm.formState.errors.email && (
                    <div className="text-red-500 text-xs text-center w-full">{loginForm.formState.errors.email.message}</div>
                  )}
                  {loginForm.formState.errors.password && (
                    <div className="text-red-500 text-xs text-center w-full">{loginForm.formState.errors.password.message}</div>
                  )}
                  {error && <div className="text-red-500 text-xs text-center w-full">{error}</div>}
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
                  <InputComponent
                    placeholder="Name"
                    {...registerForm.register('name')}
                    disabled={isLoading}
                    className="bg-gray-950 border-gray-800 focus:ring-blue-500 text-white placeholder:text-gray-500"
                  />
                  <InputComponent
                    type="email"
                    placeholder="Email"
                    {...registerForm.register('email')}
                    disabled={isLoading}
                    className="bg-gray-950 border-gray-800 focus:ring-blue-500 text-white placeholder:text-gray-500"
                  />
                  <InputComponent
                    type="password"
                    placeholder="Password"
                    {...registerForm.register('password')}
                    disabled={isLoading}
                    className="bg-gray-950 border-gray-800 focus:ring-blue-500 text-white placeholder:text-gray-500"
                  />
                  <Button
                    type="submit"
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white font-semibold text-base py-2 rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-200 border-0 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={isLoading}
                  >
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
                  {registerSuccess && !error && (
                    <div className="text-green-600 text-xs text-center mt-2">{registerSuccess}</div>
                  )}
                </form>
              </TabsContent>
            </Tabs>
            {user && <div className="text-green-600 text-center mt-4 text-lg font-medium">Welcome, {user.name}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { AuthForm }
