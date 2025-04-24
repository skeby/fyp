"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoginFields, LoginSchema } from "@/types/schema"
import Link from "next/link"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { useAppMutation } from "@/hooks/use-app"
import { paths } from "@/services/endpoint"

const LoginPage = () => {
  const form = useForm<LoginFields>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { mutate: login, isPending } = useAppMutation({
    mutationKey: ["login"],
    path: paths.auth.login,
  })

  const onSubmit: SubmitHandler<LoginFields> = (data) => {
    console.log(data)
    login(data)
  }

  return (
    <main className="flex min-h-[calc(100vh-48px)] flex-col items-center justify-center px-6 py-20">
      <Card className="h-full w-full max-w-md p-6">
        <CardHeader className="p-0">
          <CardTitle className="p-0">Login</CardTitle>
          <CardDescription>
            Don't have an account yet?{" "}
            <Link href="/signup" className="text-primary">
              Sign Up
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                loading={isPending}
                size="lg"
                type="submit"
                className="w-full"
              >
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}

export default LoginPage
