"use client";

import { signInWithGoogle } from "../services/authService";

export default function Home() {
  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}