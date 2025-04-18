import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { type Category } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { checkIfAdmin, getUserHeaders } from "@/lib/auth";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Video, Upload } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  thumbnailUrl: z.string().url({ message: "Please enter a valid URL for the thumbnail" }),
  videoUrl: z.string().url({ message: "Please enter a valid URL for the video" }),
  duration: z.number().min(0, { message: "Duration must be a positive number" }),
  categoryId: z.number().min(1, { message: "Please select a category" }),
  views: z.number().default(0),
  uploadedBy: z.string().default("Admin"),
  tags: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminPage = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const isAdmin = checkIfAdmin();
  
  // Redirect if not admin
  if (!isAdmin) {
    navigate("/");
    toast({
      title: "Access Denied",
      description: "You need admin privileges to access this page.",
      variant: "destructive"
    });
    return null;
  }

  // Fetch categories for the dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Create form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      videoUrl: "",
      duration: 0,
      categoryId: 0,
      views: 0,
      uploadedBy: "Admin",
      tags: "",
    },
  });

  // Create mutation for adding a video
  const addVideoMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Convert form values to match the API expectations
      const videoData = {
        ...values,
        uploadedAt: new Date().toISOString(),
      };
      
      return await apiRequest("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Video Added",
        description: "Your video has been added successfully.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add video: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (values: FormValues) => {
    // Submit the form data
    addVideoMutation.mutate(values);
  };

  return (
    <div className="flex flex-1 bg-black">
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              className="mr-4 text-white"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>

          <div className="bg-neutral-900 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <Video className="h-6 w-6 mr-3 text-primary" />
              <h2 className="text-xl font-bold text-white">Add New Video</h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter video title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCategories ? (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            ) : (
                              categories?.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter video description"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter thumbnail URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to the video thumbnail image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter video URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to the video file (MP4 format recommended)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Enter duration in seconds"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uploadedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Uploaded By</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter uploader name"
                            {...field}
                            defaultValue="Admin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tags separated by commas"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter tags separated by commas (e.g. finance, investing, stocks)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={addVideoMutation.isPending}
                >
                  {addVideoMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> Add Video
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;