
import * as PixiReact from '@pixi/react';
import { useState, useEffect } from 'react';
import { dimensionType } from '../../@types';
import AppStage from './AppStage';
import { useAviator } from '../../store/aviator';

// DO NOT remove: Cast to any to handle missing type definitions in some environments
const { Stage, Container } = PixiReact as any;

const PIXIComponent = ({ pixiDimension, curPayout, trigParachute }: {
    pixiDimension: dimensionType, curPayout: number, trigParachute: { uniqId: number, isMe: boolean }
}) => {
    const { aviatorState } = useAviator()
    const [scale, setScale] = useState(1)

    useEffect(() => {
        if (pixiDimension.width > 0 && pixiDimension.height > 0) {
            const scaleX = pixiDimension.width / aviatorState.dimension.width;
            const scaleY = pixiDimension.height / aviatorState.dimension.height;
            setScale(Math.min(scaleX, scaleY));
        }
    }, [pixiDimension, aviatorState.dimension]);

    if (pixiDimension.width === 0 || pixiDimension.height === 0) return null;

    return (
        <Stage width={pixiDimension.width} height={pixiDimension.height} options={{ antialias: true, backgroundAlpha: 0 }}>
            <Container scale={scale}>
                <AppStage payout={curPayout} game_anim_status={aviatorState.game_anim_status} dimension={aviatorState.dimension} pixiDimension={pixiDimension} trigParachute={trigParachute} />
            </Container>
        </Stage>
    );
};
export default PIXIComponent;