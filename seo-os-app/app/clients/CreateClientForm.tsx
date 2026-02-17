"use client";

import { createClient } from "./actions";

export function CreateClientForm() {
  return (
    <form action={createClient}>
      <label htmlFor="name">Client Name</label>{" "}
      <input
        id="name"
        name="name"
        type="text"
        required
        placeholder="Acme Corp"
      />{" "}
      <button type="submit">Create Client</button>
    </form>
  );
}
