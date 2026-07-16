import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Full Name can only contain letters and spaces' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must include at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must include at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must include at least one number (0-9)' })
    .regex(/[!@&#]/, { message: 'Password must include at least one special character (!@&#)' }),
});

export const internDetailsSchema = z.object({
  fullName: z.string()
    .min(2, { message: 'Full Name is required' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Full Name can only contain letters and spaces' }),
  fatherName: z.string().min(2, { message: "Father's Name is required" }),
  email: z.string().email({ message: 'Valid email is required' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters long' }),
  university: z.string().min(2, { message: 'University name is required' }),
  department: z.string().min(2, { message: 'Department is required' }),
  semester: z.string().min(1, { message: 'Semester is required' }),
  cgpa: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0.0).max(4.0, { message: 'CGPA must be between 0.0 and 4.0' })
  ),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions to proceed',
  }),
});

export const adminPasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
