"use client";

import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { TextField } from "@mui/material";
import { Field, FieldProps, Form, Formik } from "formik";
import { Mail, MapPin, Phone } from "lucide-react";
import * as Yup from "yup";

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  subject: Yup.string()
    .min(5, "Subject must be at least 5 characters")
    .required("Subject is required"),
  message: Yup.string()
    .min(20, "Message must be at least 20 characters")
    .required("Message is required"),
});

export default function ContactPage() {
  const { mutation, isLoading } = useMutation();

  const initialValues: ContactFormValues = {
    name: "",
    email: "",
    subject: "",
    message: "",
  };

  const handleSubmit = async (
    values: ContactFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    const res = await mutation("public/contact", {
      method: "POST",
      body: values,
      isAlert: true,
    });
    if (res?.results?.success) {
      resetForm();
    }
  };

  return (
    <div className="bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-brand uppercase tracking-wider mb-3">
            Get In Touch
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Have a question, feedback, or want to explore the Organization plan?
            {"We're"} here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info column */}
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <a
                  href="mailto:support@devvelocity.in"
                  className="text-sm text-gray-500 hover:text-brand"
                >
                  support@devvelocity.in
                </a>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Support Hours</p>
                <p className="text-sm text-gray-500">
                  Mon – Fri, 10 AM – 6 PM IST
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p className="text-sm text-gray-500">India</p>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={contactSchema}
              onSubmit={handleSubmit}
            >
              <Form noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field name="name">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Your Name"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        size="small"
                      />
                    )}
                  </Field>
                  <Field name="email">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        type="email"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        size="small"
                      />
                    )}
                  </Field>
                </div>

                <Field name="subject">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Subject"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      size="small"
                    />
                  )}
                </Field>

                <Field name="message">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Message"
                      multiline
                      rows={5}
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>

                <CustomButton
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  fullWidth
                >
                  Send Message
                </CustomButton>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
