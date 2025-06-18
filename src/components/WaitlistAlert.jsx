"use client";

import { Alert } from "flowbite-react";

export function WaitlistAlert() {
  return (
    <Alert color="success" onDismiss={() => alert('Please fill out this form!')}>
   <a href="https://docs.google.com/forms/d/e/1FAIpQLSfb_5tHzHN3NrhJFKpRhEhLkQIDQrXdH7jXGKK-PZrt4KBaAg/viewform?usp=sharing&ouid=105836010722188729845">
      <span className="font-medium h-[10rem]">Join the Waitlist</span> 
	 </a>
    </Alert>
  );
}

