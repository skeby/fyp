"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SignUpFields, SignUpSchema } from "@/types/schema";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useAppMutation } from "@/hooks/use-app";
import { paths } from "@/services/endpoint";
import { LOGIN_ROUTE } from "../../static";
import { useRouter } from "@bprogress/next/app";

const SignUpPage = () => {
  const router = useRouter();

  const form = useForm<SignUpFields>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      username: "",
      password: "",
    },
  });

  const { mutate: signup, isPending } = useAppMutation({
    mutationKey: ["signup"],
    path: paths.auth.signup,
    onSuccess: () => {
      router.push("/login");
    },
  });

  const onSubmit: SubmitHandler<SignUpFields> = (data) => {
    signup(data);
  };

  return (
    <main className="flex min-h-[calc(100vh-48px)] flex-col items-center justify-center px-5 py-4 min-[370px]:px-4 sm:px-6 sm:py-7">
      <Card className="h-full w-full max-w-md p-6">
        <CardHeader className="p-0">
          <CardTitle className="p-0">Sign Up</CardTitle>
          <CardDescription>
            Already have an account?{" "}
            <Link href={LOGIN_ROUTE} className="text-primary">
              Login
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
};

export default SignUpPage;
