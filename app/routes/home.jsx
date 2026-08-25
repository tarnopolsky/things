import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    // The name lives here rather than on the page itself.
    { title: "Natasha Tarnopolsky — Things I've been up to" },
    {
      name: "description",
      content:
        "Hobbies, mostly — pottery, drawing, flowers, bread, houseplants, day trips, and the photographs.",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
