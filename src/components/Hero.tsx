import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, ContactShadows, Environment, Center } from "@react-three/drei";
import * as THREE from "three";
import { motion, useInView } from "motion/react";
import { cn } from "../libs/utils";

const MODEL_PATH = "/ibex_statue/source/theappxr_Statua_Ibex_NODRACO_standard.glb";

function Model() {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const initialScale = 0.01;
  const targetScale = 1;
  const progress = useRef(0);
  const rotationSpeed = useRef(0);
  const targetRotationSpeed = 0.3;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Animate progress from 0 to 1
    if (progress.current < 1) {
      progress.current = Math.min(progress.current + delta * 0.5, 1);

      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress.current, 3);

      // Zoom: scale from small to target
      const currentScale = THREE.MathUtils.lerp(initialScale, targetScale, eased);
      groupRef.current.scale.setScalar(currentScale);

      // Rotate: spin during zoom
      groupRef.current.rotation.y = eased * Math.PI * 2;
    } else {
      // Smoothly ramp up rotation speed
      rotationSpeed.current = THREE.MathUtils.lerp(
        rotationSpeed.current,
        targetRotationSpeed,
        delta * 2,
      );

      // Continue rotating after animation ends
      groupRef.current.rotation.y += delta * rotationSpeed.current;
    }
  });

  return (
    <group ref={groupRef} scale={initialScale}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <spotLight position={[50, 50, 10]} angle={0.15} penumbra={1} intensity={1} />
      <Suspense fallback={null}>
        <Model />
        <ContactShadows position={[0, -1, 0]} scale={10} blur={2} far={4} opacity={0.5} />
      </Suspense>
      <Environment preset="city" />
      <OrbitControls
        enableZoom={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_PATH);

export default function Hero() {
  return (
    <section className="relative h-screen w-full">
      <div className="absolute inset-0 flex size-full flex-col justify-between px-8 py-9 sm:px-16">
        <div className="flex items-center justify-between">
          <h1 className="font-dmSans w-full text-5xl leading-[100%] tracking-widest text-nowrap sm:text-[64px] lg:text-[100px]">
            <TextSlideAnimation text="MUHAMMAD /n FATHUR RAIYAN" delay={2.2} />
          </h1>
        </div>
        <div className="flex justify-between max-lg:flex-col max-lg:gap-8">
          <p className="mt-4 max-w-46 text-justify text-xs uppercase">
            <TextSlideAnimation
              delay={2.4}
              margin={false}
              text="I HELP COMPANIES, BRANDS AND ENTERPRENEURS DEVELOP DIGITAL PRODUCTS AND THEIR GOALS"
            />
          </p>
          <h2 className="font-dmSans text-5xl leading-[100%] tracking-widest sm:text-[64px] lg:text-right lg:text-[100px]">
            <TextSlideAnimation text="CREATIVE /n DEVELOPER" delay={2.6} margin={false} />
          </h2>
        </div>
      </div>
      <HeroCanvas />
    </section>
  );
}

export function TextSlideAnimation({
  text,
  margin = true,
  withLineHeight = false,
  delay = 0,
  lineHeight,
  className,
}: {
  text: string;
  margin?: boolean;
  withLineHeight?: boolean;
  delay?: number;
  lineHeight?: string | number;
  className?: string;
}) {
  const phrases = text?.split(" ");
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: margin ? "0% 0% -25% 0%" : "0% 0% 0% 0%" });
  const isSingleWord = phrases?.length === 1;

  return phrases?.map((phrase, index) =>
    phrase === "/n" ? (
      <br key={index} />
    ) : (
      <span
        className={cn(
          `mr-[0.25em] inline-flex overflow-hidden`,
          withLineHeight ? "leading-none" : "",
          isSingleWord || index === phrases?.length - 1 ? "mr-0" : "",
          className,
        )}
        key={index}
        ref={ref}
        style={lineHeight ? { lineHeight } : undefined}
      >
        <motion.span
          className={`inline-block ${withLineHeight ? "leading-none" : ""}`}
          style={{
            ...(lineHeight ? { lineHeight } : {}),
            transformOrigin: "bottom left",
          }}
          initial={{ y: "100%", rotate: 10 }}
          animate={{
            y: isInView ? 0 : "100%",
            rotate: isInView ? 0 : 10,
            transition: {
              duration: 0.5,
              ease: [0.215, 0.61, 0.355, 1],
              delay: delay + index * 0.05,
            },
          }}
        >
          {phrase}
        </motion.span>
      </span>
    ),
  );
}
