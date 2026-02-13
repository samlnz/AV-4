
import * as PixiReact from "@pixi/react";
import { TextStyle, Texture, Graphics as GraphicsRaw, ColorMatrixFilter } from "pixi.js";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { renderCurve as _renderCurve, createGradTexture, curveFunction, maskDraw as _drawMask, smoothen, _drawOuterBoundery, _drawInnerBoundery, interpolate, webpORpng, ENV } from "../../utils";
import { dimensionType, gameAnimStatusType } from "../../@types";

// DO NOT remove: Cast to any to handle missing type definitions in some environments
const { AnimatedSprite, Container, Graphics, Sprite, Text, useTick } = PixiReact as any;

const AppStage = ({ payout, game_anim_status, dimension, pixiDimension, trigParachute }: { payout: number, game_anim_status: gameAnimStatusType, dimension: dimensionType, pixiDimension: dimensionType, trigParachute: { uniqId: number, isMe: boolean } }) => {
    const tickRef = useRef(0)
    const [hueRotate, setHueRotate] = useState(0)
    const [planeScale, setPlaneScale] = useState(0.2)
    const [pulseBase, setPulseBase] = useState(0.8)
    const [planeFrames, setPlaneFrames] = useState<Texture[] | undefined>()
    const [planeX, setPlaneX] = useState(0)
    const [ontoCorner, setOntoCorner] = useState(0)

    const renderCurve = useCallback((g: GraphicsRaw) => _renderCurve(g, dimension), [dimension])
    const drawOuterBoundery = useCallback((g: GraphicsRaw) => _drawOuterBoundery(g, dimension), [dimension])
    const drawInnerBoundery = useCallback((g: GraphicsRaw) => _drawInnerBoundery(g, dimension), [dimension])

    const gradTexture = useMemo(() => createGradTexture(dimension), [dimension])

    useEffect(() => {
        const _plane = []
        for (let i = 1; i <= 15; i++) {
            _plane.push(Texture.from(`plane-anim-${i}.${webpORpng}`));
        }
        setPlaneFrames(_plane)
        
        const handleResize = () => {
            setPlaneScale(interpolate(window.innerWidth, 400, 1920, 0.5, 0.2))
            setPulseBase(interpolate(window.innerWidth, 400, 1920, 0.6, 0.8))
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useTick((delta: any) => {
        // DO NOT change: delta can be a number or Ticker object, cast to any is safer for arithmetic
        setHueRotate(prev => (prev + (delta?.deltaTime ?? delta) / 500))
        if (game_anim_status === "ANIM_STARTED") {
            tickRef.current += (delta?.deltaTime ?? delta) * 0.01
            setPlaneX(smoothen(Math.min(tickRef.current * 300, dimension.width - 40), { width: dimension.width - 40, height: dimension.height - 40 }))
        } else if (game_anim_status === "WAITING") {
            tickRef.current = 0
            setPlaneX(0)
        }
    });

    const posPlane = useMemo(() => {
        const _ontoCorner = game_anim_status === "ANIM_CRASHED" ? ontoCorner : 0
        const pulse = Math.sin(tickRef.current) * 0.06;
        return {
            x: (pulseBase + pulse) * planeX + _ontoCorner * 150 + 40,
            y: dimension.height - 40 - (1 - pulse) * curveFunction(planeX, { width: dimension.width - 40, height: dimension.height - 40 }) - _ontoCorner * 50
        }
    }, [planeX, dimension, game_anim_status, ontoCorner, pulseBase])

    const colorMatrix = useMemo(() => {
        const c = new ColorMatrixFilter();
        c.hue(hueRotate * 100, true);
        return c
    }, [hueRotate])

    return (
        <Container>
            <Sprite filters={[colorMatrix]} texture={gradTexture} width={dimension.width - 40} height={dimension.height - 40} position={{ x: 40, y: 0 }} />
            <Graphics visible={game_anim_status === "ANIM_STARTED"} draw={renderCurve} />
            
            <Container visible={game_anim_status !== "WAITING"}>
                {planeFrames && (
                    <AnimatedSprite
                        rotation={-Math.PI / 10}
                        textures={planeFrames}
                        anchor={{ x: 0.5, y: 0.5 }}
                        scale={planeScale}
                        animationSpeed={0.5}
                        isPlaying={true}
                        position={posPlane}
                    />
                )}
                <Text 
                    visible={game_anim_status === "ANIM_STARTED"} 
                    text={payout.toFixed(2) + "x"}
                    anchor={0.5}
                    x={dimension.width / 2}
                    y={dimension.height / 2}
                    style={new TextStyle({
                        fontFamily: 'Roboto',
                        fontSize: 120,
                        fontWeight: '900',
                        fill: '#ffffff',
                        /* Fix: Updated stroke style for PixiJS v8 compatibility */
                        stroke: { color: '#000000', width: 4 }
                    })} 
                />
            </Container>
            <Graphics draw={drawInnerBoundery} />
            <Graphics draw={drawOuterBoundery} />
        </Container>
    );
};
export default AppStage;
