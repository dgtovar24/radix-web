import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Mock patients data
  const patients = [
    { id: 101, fullName: "Maria Gonzalez" },
    { id: 102, fullName: "Juan Perez" },
    { id: 103, fullName: "Ana Martinez" },
    { id: 104, fullName: "Carlos Sanchez" },
  ];

  return new Response(JSON.stringify(patients), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}