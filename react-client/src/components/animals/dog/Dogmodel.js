import React, { Suspense } from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model(props) {
    const { scene } = useGLTF("augmented/dog.glb");
    return <primitive object={scene} />;
}

export default function DogModel() {
    return (
        <Canvas pixelRatio={[1, 2]} camera={{ position: [-10, 15, 15], fov: 15 }}>
            <ambientLight intensity={1} />
            <Suspense fallback={null}>
                <Model />
            </Suspense>
            <OrbitControls />
        </Canvas>
    );
}
