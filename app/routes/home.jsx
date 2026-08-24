import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "A Conscious Pause" },
    {
      name: "description",
      content:
        "What I did with a deliberate pause — clay, drawing, flowers, bread, day trips, and a lot of photographs.",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
