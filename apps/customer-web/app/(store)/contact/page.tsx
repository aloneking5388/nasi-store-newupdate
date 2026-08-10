"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form); // Replace with API call
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      {/* LEFT SIDE - Address + Map */}
      <div className="space-y-6 bg-gray-50 p-6 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-blue-700">Get in Touch</h2>
        <div className="text-gray-600 max-sm:text-sm space-y-2">
          <p>
            <strong>Address:</strong> Nasi Dgital PVT Ltd, Kangwai Navsari,
            Gujarat, India
          </p>
          <p>
            <strong>Phone:</strong> +91-6356001885
          </p>
          <p>
            <strong>Email:</strong> support@nasistore.com
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow">
          <div className="rounded-lg overflow-hidden shadow">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d515.0450164783913!2d73.17297131246313!3d20.868315345642674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be08c2d008881ed%3A0x94a01367f666ad9d!2sV59F%2B97C%2C%20Kumkotar%20-%20Kangvai%20Rd%2C%20Kangvai%2C%20Gujarat%20396560%2C%20India!5e1!3m2!1sen!2sug!4v1759836040165!5m2!1sen!2sug"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-50 p-6 rounded-lg shadow"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Contact Us</h2>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Type your message here..."
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Send Message
        </Button>
      </form>
    </div>
  );
};

export default Contact;
