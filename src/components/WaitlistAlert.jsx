"use client";

import { Alert } from "flowbite-react";

export default function WaitlistAlert() {
  return (
    <Alert color="success" onDismiss={() => alert('Please fill out this form!')}>
   <a className="block text-center" href="https://docs.google.com/forms/d/e/1FAIpQLSfb_5tHzHN3NrhJFKpRhEhLkQIDQrXdH7jXGKK-PZrt4KBaAg/viewform?usp=sharing&ouid=105836010722188729845">
      <span className="font-medium text-6xl">Join the Waitlist</span> 
	 </a>
    </Alert>
  );
}

