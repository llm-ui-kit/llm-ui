import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Email is not valid.",
  }),
});

export const WaitlistForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        Accept: "application.json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (data.message === "success") {
      toast.success("Subscribed");
      form.reset();
    } else {
      toast.error("Something went wrong", {
        description: data.message ?? "Please try again!",
      });
    }
  };

  return (
    <div className="relative flex w-full items-center justify-center">
      <div className="bg-background rounded-xl border px-4 py-5 sm:p-6">
        <div className="flex w-full max-w-sm flex-col gap-y-5">
          <div className="space-y-3">
            <Mail className="size-10" />
            <h1 className="font-heading text-2xl tracking-wide">
              Subscribe for email updates
            </h1>
            <p className="text-muted-foreground text-sm">
              Keep up to date with llm-ui
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Subscribe
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
