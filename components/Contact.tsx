import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';

// Client-side validation schema matching server
const ContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-\.'’]+$/, 'Name contains invalid characters')
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

const Contact: React.FC = () => {
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
        body: JSON.stringify(formData),
      });

      const data: ContactResponse = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        // Reset success state after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        // Handle server validation errors
        if (data.field) {
          setErrors({ [data.field]: data.message || data.error });
        } else {
          setSubmitError(data.message || data.error || 'Unable to send message. Please try again.');
        }
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isFormValid = formData.name.length >= 2 && formData.email.includes('@') && formData.message.length >= 10;

  return (
    <section id="contact" className="py-24 bg-samurai-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-sm font-bold tracking-[0.3em] text-samurai-red mb-2 uppercase">Get In Touch</h2>
              <h3 className="font-display text-5xl md:text-6xl text-white uppercase font-bold leading-tight">
                Let's Make Something Great
              </h3>
            </div>
            
            <p className="text-gray-400 leading-relaxed mb-8">
              Ready to take your sound to the next level? Whether you need production, mixing, or custom beats, we're here to help bring your vision to life.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-samurai-red/10 rounded-lg">
                  <Mail className="text-samurai-red" size={24} />
                </div>
                <div>
                  <h4 className="font-display text-lg text-white mb-1 uppercase">Email</h4>
                  <p className="text-gray-400">info@studioeighty7.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-samurai-red/10 rounded-lg">
                  <MessageSquare className="text-samurai-red" size={24} />
                </div>
                <div>
                  <h4 className="font-display text-lg text-white mb-1 uppercase">Social Media</h4>
                  <p className="text-gray-400">@studioeighty7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white/5 border border-white/10 p-8">
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="text-samurai-red mx-auto mb-4" size={64} />
                <h4 className="font-display text-2xl text-white mb-2 uppercase">Message Sent!</h4>
                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* General submit error */}
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                    maxLength={100}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={`w-full bg-white/5 border text-white px-4 py-3 outline-none transition-colors ${
                      errors.name
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-samurai-red'
                    }`}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                    maxLength={255}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`w-full bg-white/5 border text-white px-4 py-3 outline-none transition-colors ${
                      errors.email
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-samurai-red'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange('message')}
                    required
                    rows={4}
                    maxLength={1000}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={`w-full bg-white/5 border text-white px-4 py-3 outline-none transition-colors resize-none ${
                      errors.message
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-samurai-red'
                    }`}
                    placeholder="Tell us about your project..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.message && (
                      <p id="message-error" className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.message}
                      </p>
                    )}
                    <p className={`text-xs ${errors.message ? 'text-red-400 ml-auto' : 'text-gray-500'}`}>
                      {formData.message.length}/1000
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="w-full bg-samurai-red hover:bg-red-700 text-white font-display text-lg uppercase tracking-wider py-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-pulse">Sending...</span>
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Subscription Notice */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-gray-500">
                By sending this message, you agree to receive email updates from Studio Eighty7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
