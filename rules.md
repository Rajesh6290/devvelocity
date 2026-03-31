# DevVelocity — Agent & Developer Rules

These rules **must be followed** for every file created or modified in this codebase.
No exceptions.

---

## 1. Project Architecture

```
src/
├── app/                     ← Next.js App Router (routes only)
│   ├── (public)/            ← Public-facing pages
│   ├── (auth)/              ← Login, register, forgot password
│   ├── (user)/              ← Authenticated user pages
│   └── (admin)/             ← Admin pages
├── features/                ← One folder per feature domain
│   └── <feature-name>/
│       ├── components/      ← UI components for this feature
│       ├── hooks/           ← Feature-specific hooks
│       ├── services/        ← API call wrappers (using useSwr / useMutation)
│       ├── types/           ← TypeScript interfaces for this feature
│       └── index.ts         ← Public exports
└── shared/
    ├── core/                ← Reusable UI primitives (CustomButton, CustomTable, etc.)
    ├── hooks/               ← Global hooks (useSwr, useMutation)
    ├── lib/                 ← Utility libraries (mediaService, etc.)
    ├── layouts/             ← Page layout wrappers
    ├── provider/            ← Context providers
    ├── store/               ← Global state
    ├── types/               ← Shared TypeScript interfaces
    └── utils/               ← Pure utility functions
```

- Feature folders must be **self-contained**. Cross-feature imports are not allowed.
- Only `shared/` can be imported across features.
- Route files inside `app/` must stay thin — delegate all logic to `features/`.

---

## 2. TypeScript Rules

- **Never use `any`**. Every value must have a proper type.
- All props, API responses, and state variables must have a named `interface` or `type`.
- Define interfaces in the feature's `types/` folder or `shared/types/`.
- Use `unknown` instead of `any` when the shape is truly unknown, then narrow it.
- Prefer `interface` for object shapes, `type` for unions/intersections.

```ts
// ✅ Correct
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "organization";
}

// ❌ Wrong
const user: any = { ... };
const handleData = (data: any) => { ... };
```

---

## 3. Data Fetching Rules

### GET requests → use `useSwr`

Import from `@/shared/hooks/useSwr`.

```ts
import useSwr from "@/shared/hooks/useSwr";

const { data, isLoading, mutate } = useSwr<User[]>("users");
// Resolves to GET /api/users
```

- Pass `null` as path to conditionally skip fetching:
  ```ts
  const { data } = useSwr(userId ? `users/${userId}` : null);
  ```
- Use `mutate()` to refresh data after a mutation.
- Provide a generic type to `useSwr<T>` for fully typed responses.

### POST / PUT / PATCH / DELETE → use `useMutation`

Import from `@/shared/hooks/useMutation`.

```ts
import useMutation from "@/shared/hooks/useMutation";

const { mutation, isLoading } = useMutation();

// POST
const res = await mutation("users", {
  method: "POST",
  body: { name: "John", email: "john@example.com" },
  isAlert: true,
});

// PUT
const res = await mutation(`users/${id}`, {
  method: "PUT",
  body: payload,
  isAlert: true,
});

// PATCH
const res = await mutation(`users/${id}`, {
  method: "PATCH",
  body: { status: "active" },
  isAlert: true,
});

// DELETE
const res = await mutation(`users/${id}`, {
  method: "DELETE",
  isAlert: true,
});
```

- Always set `isAlert: true` when user feedback is needed (shows toast).
- Check `res?.results?.success` before proceeding after mutation.
- Do **not** use `fetch` or `axios` directly in components or hooks — always go through `useMutation`.

---

## 4. UI Component Rules

### CustomButton

Always use `CustomButton` from `@/shared/core/CustomButton`. Never use MUI `Button` directly.

```tsx
import CustomButton from "@/shared/core/CustomButton";

// Primary action
<CustomButton variant="primary" type="submit" loading={isLoading}>
  Save
</CustomButton>

// Secondary / outline
<CustomButton variant="secondary" onClick={handleCancel}>
  Cancel
</CustomButton>

// Destructive / delete
<CustomButton variant="cancel" onClick={handleDelete}>
  Delete
</CustomButton>

// Tertiary
<CustomButton variant="tertiary" onClick={handleAction}>
  Preview
</CustomButton>
```

Available variants: `primary` | `secondary` | `cancel` | `tertiary` | `refresh`
Available sizes: `small` | `medium` | `large` | `sm`

### CustomTable

Always use `CustomTable` from `@/shared/core/CustomTable` for any tabular data display.

```tsx
import CustomTable, { Column, Action } from "@/shared/core/CustomTable";

interface JobRow {
  id: string;
  title: string;
  company: string;
  status: "applied" | "interview" | "rejected";
}

const columns: Column<JobRow>[] = [
  { field: "title", title: "Job Title", sortable: true },
  { field: "company", title: "Company", sortable: true },
  {
    field: "status",
    title: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const actions: Action<JobRow>[] = [
  {
    icon: <EditIcon />,
    tooltip: "Edit",
    onClick: (row) => handleEdit(row),
  },
  {
    icon: <DeleteIcon />,
    tooltip: "Delete",
    onClick: (row) => handleDelete(row),
    hidden: (row) => row.status === "rejected",
  },
];

<CustomTable
  data={jobs}
  columns={columns}
  actions={actions}
  options={{ search: true, pagination: true, pageSize: 10 }}
/>;
```

---

## 5. Form Rules — Formik + Yup

Every form must use **Formik** for state management and **Yup** for validation.
Never manage form state manually with `useState` for individual fields.

### Standard Form Pattern

- **Never use `useFormik`**. Always use the `<Formik>` component with `<Field>` and `<ErrorMessage>`.

```tsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";

// 1. Define interface for form values
interface LoginFormValues {
  email: string;
  password: string;
}

// 2. Define Yup validation schema
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

// 3. Component
const LoginForm = () => {
  const { mutation, isLoading } = useMutation();

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values: LoginFormValues) => {
    const res = await mutation("auth/login", {
      method: "POST",
      body: values,
      isAlert: true,
    });
    if (res?.results?.success) {
      // handle success
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {/* 4. Use <Form> instead of <form> — it auto-wires handleSubmit */}
      <Form noValidate>
        {/* 5. Use <Field> for inputs, <ErrorMessage> for errors */}
        <div>
          <label htmlFor="email">Email</label>
          <Field
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
          />
          <ErrorMessage name="email">
            {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
          </ErrorMessage>
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <Field
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
          />
          <ErrorMessage name="password">
            {(msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>}
          </ErrorMessage>
        </div>

        <CustomButton type="submit" variant="primary" loading={isLoading}>
          Login
        </CustomButton>
      </Form>
    </Formik>
  );
};
```

### For MUI TextField — use `<Field as={TextField}>` with render prop

```tsx
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import { TextField } from "@mui/material";

<Formik
  initialValues={initialValues}
  validationSchema={schema}
  onSubmit={handleSubmit}
>
  <Form noValidate>
    <Field name="email">
      {({ field, meta }: FieldProps) => (
        <TextField
          {...field}
          id="email"
          label="Email"
          type="email"
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
          fullWidth
        />
      )}
    </Field>

    <CustomButton type="submit" variant="primary" loading={isLoading}>
      Submit
    </CustomButton>
  </Form>
</Formik>;
```

### Error Message Rules

- **Never use `useFormik`**. Always use `<Formik>`, `<Form>`, `<Field>`, `<ErrorMessage>`.
- `<ErrorMessage>` render prop must wrap the message in `<p className="text-red-500 text-sm mt-1">`.
- `<ErrorMessage>` only renders when the field is both **touched and invalid** — no extra condition needed.
- Never inline validate without Yup — all rules live in the schema.
- For MUI inputs, use `<Field name="...">` with `FieldProps` render prop and pass `meta.touched` + `meta.error` to `error` / `helperText`.

---

## 6. File Upload Rules — MediaService

All file uploads must go through `MediaService` from `@/shared/lib/mediaService`.
Never call Cloudinary or any storage API directly from components.

`MediaService.uploadFile` is a **server-side** function.
Call it inside a **Next.js Route Handler** (`app/api/.../route.ts`), not in a client component.

### Client — send file via `useMutation`

```tsx
const { mutation, isLoading } = useMutation();

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  const res = await mutation("upload/media", {
    method: "POST",
    body: formData,
    isFormData: true,
    isAlert: true,
    onProgress: (progress) => setUploadProgress(progress),
  });

  if (res?.results?.success) {
    const uploadedUrl: string = res.results.data.url;
    formik.setFieldValue("imageUrl", uploadedUrl);
  }
};
```

### Server — Route Handler using MediaService

```ts
// app/api/upload/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/shared/lib/mediaService";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "No file provided" },
      { status: 400 }
    );
  }

  const uploaded = await MediaService.uploadFile(file);

  return NextResponse.json({ success: true, data: uploaded });
}
```

Allowed file types (enforced by `MediaService`): JPEG, PNG, WebP, MP4, WebM, MOV, PDF.
Max size: **10MB**.

---

## 7. Naming Conventions

| Item                  | Convention               | Example                    |
| --------------------- | ------------------------ | -------------------------- |
| Components            | PascalCase               | `JobTrackerCard.tsx`       |
| Hooks                 | camelCase prefixed `use` | `useJobList.ts`            |
| Interfaces            | PascalCase               | `interface JobApplication` |
| Types                 | PascalCase               | `type ApplicationStatus`   |
| Files (non-component) | camelCase                | `jobService.ts`            |
| Folders               | kebab-case               | `job-tracker/`             |
| Constants             | UPPER_SNAKE_CASE         | `MAX_FILE_SIZE`            |
| API path strings      | kebab-case               | `"job-applications/list"`  |

---

---

## 8. General Rules

- **No `console.log`** in committed code. Use proper error boundaries or logging utilities.
- **No hardcoded API URLs** — always use the `useSwr` / `useMutation` hooks which resolve through `/api/`.
- **No inline styles** unless absolutely unavoidable — use Tailwind classes.
- **No direct `localStorage` access in components** — use `getFromLocalStorage` / `saveToLocalStorage` from `@/shared/utils`.
- **Client components** must have `"use client"` at the top. Server components must not.
- **`"use client"`** must be the very first line of the file — no comments or imports above it.
- Every page component must be a `default export`.
- All shared utilities and hooks must be named exports.
