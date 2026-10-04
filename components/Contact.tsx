import React, { useState } from 'react';
import { z } from 'zod';
import type { Service } from '@/types';

// The production CSP forbids eval; zod's JIT probe would trip it
z.config({ jitless: true });

// Client-side validation schema matching server
const ContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[\p{L}\p{M}0-9\s\-\.'’]+$/u, 'Name contains invalid characters')
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .email('Please provide a valid email address')
    .transform((val) => val.trim().toLowerCase()),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be 1000 characters or less')
    .transform((val) => val.trim()),
});

type FormData = z.infer<typeof ContactSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

interface ContactResponse {
  success: boolean;
  message: string;
  error?: string;
  field?: string;
}

interface ContactProps {
  services: Service[] | null;
  selectedService: string | null;
  onSelectService: (title: string) => void;
}

const OTHER_SERVICE = 'Something else';

const Contact: React.FC<ContactProps> = ({
  services,
  selectedService,
  onSelectService,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sanitize input to prevent XSS
  const sanitizeInput = (value: string): string => {
    return value
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateForm = (): boolean => {
    try {
      ContactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, service: selectedService ?? undefined }),
      });

      const data: ContactResponse = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        // Handle server validation errors
        if (data.field) {
          setErrors({ [data.field]: data.message || data.error });
        } else {
          setSubmitError(data.message || data.error || 'The request was not sent. Try again, or email us directly.');
        }
      }
    } catch {
      setSubmitError('The request was not sent. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.length >= 2 && formData.email.includes('@') && formData.message.length >= 10;
  const options = [...(services ?? []).map((service) => service.title), OTHER_SERVICE];

  const fieldClass = (field: keyof FormData) =>
    `w-full rounded-md border bg-walnut px-4 py-3 text-bone placeholder:text-dust ${
      errors[field] ? 'border-amber' : 'border-line'
    }`;

  return (
    <section id="book" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <h2 className="display text-4xl md:text-6xl mb-8">Book a session</h2>
          <p className="text-dust max-w-[40ch] mb-8">
            Tell us what you are working on and we will reply within 24 hours.
          </p>
          <ul className="space-y-2">
            <li>
              <a href="mailto:info@studioeighty7.com" className="text-amber hover:underline">
                info@studioeighty7.com
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/studioeighty7/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber hover:underline"
              >
                @studioeighty7 on Instagram
              </a>
            </li>
          </ul>
        </div>

        <div className="rounded-xl bg-panel p-6 md:p-8">
          {isSubmitted ? (
            <div className="py-8">
              <h3 className="display text-4xl mb-4">Request sent</h3>
              <p className="text-dust mb-6">We reply within 24 hours.</p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="rounded-md border border-bone px-5 py-2 font-semibold"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {submitError && <p role="alert">{submitError}</p>}

              <fieldset>
                <legend className="mb-2 text-sm text-dust">What do you need?</legend>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <label key={option}>
                      <input
                        type="radio"
                        name="service"
                        value={option}
                        checked={selectedService === option}
                        onChange={() => onSelectService(option)}
                        className="peer sr-only"
                      />
                      <span className="block cursor-pointer rounded-full border border-line px-4 py-2 text-sm peer-checked:border-bone peer-checked:bg-bone peer-checked:text-walnut peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-amber">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="name" className="mb-2 block text-sm text-dust">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  maxLength={100}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={fieldClass('name')}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-amber">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-dust">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  maxLength={255}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={fieldClass('email')}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-amber">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm text-dust">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  required
                  rows={4}
                  maxLength={1000}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  className={`${fieldClass('message')} resize-none`}
                />
                <div className="mt-2 flex justify-between gap-4 text-sm">
                  {errors.message && (
                    <p id="message-error" className="text-amber">
                      {errors.message}
                    </p>
                  )}
                  <p className="data ml-auto text-dust">{formData.message.length}/1000</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full rounded-md bg-rec px-6 py-3 font-semibold text-bone disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
