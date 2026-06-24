import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light2.png";


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <Accordion
          type="single"
          collapsible
          defaultValue="photography"
          className="max-w-lg"
        >
          <AccordionItem value="photography">
            <AccordionTrigger>Photography & camera collecting</AccordionTrigger>
            <AccordionContent>
              I explored digital and film photography and started collecting cameras.
              It became a way to slow down and notice light, texture, and small everyday moments.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="flowers">
            <AccordionTrigger>Home floristry</AccordionTrigger>
            <AccordionContent>
              I created bouquets at home, including a large birthday batch that lasted for weeks.
              Working with flowers became a practice of presence and temporary beauty.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="plants">
            <AccordionTrigger>Indoor gardening</AccordionTrigger>
            <AccordionContent>
              I took care of houseplants and watched them grow and transform.
              Some of them, like rare monsteras and cacti, became long-term companions in my space.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="art">
            <AccordionTrigger>Drawing & visual practice</AccordionTrigger>
            <AccordionContent>
              I drew consistently for almost three months and noticeably improved my skills.
              It became a quiet daily structure and a way to process thoughts visually.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ceramics">
            <AccordionTrigger>Ceramics & pottery wheel</AccordionTrigger>
            <AccordionContent>
              I trained in a ceramics studio and learned the pottery wheel.
              Even though it was expensive, every session left me feeling reset and re-centered.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="food">
            <AccordionTrigger>Cooking & baking</AccordionTrigger>
            <AccordionContent>
              I baked bread, made pancakes, jam, pickled vegetables, cooked brisket and ice cream.
              I started building a personal archive of recipes that actually worked for me.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="body">
            <AccordionTrigger>Movement & body care</AccordionTrigger>
            <AccordionContent>
              I did weekly tennis and Pilates, not because I love sports, but to stay connected to my body gently.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="therapy">
            <AccordionTrigger>Therapy & inner work</AccordionTrigger>
            <AccordionContent>
              Weekly therapy sessions helped me process long-term stress patterns and emotional load.
              It became a stable anchor during a very unstable external period.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="retreat">
            <AccordionTrigger>Silent retreat</AccordionTrigger>
            <AccordionContent>
              I attended a one-day silent yoga retreat.
              It created a rare experience of full internal quiet and reset.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="context">
            <AccordionTrigger>Life context</AccordionTrigger>
            <AccordionContent>
              This period also included navigating uncertainty and external stress.
              The focus was not productivity, but rebuilding stability and presence in everyday life.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
