import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Flex, Icon, spacing} from '@gravity-ui/uikit';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';

import {block} from '../../../utils';
import {PreviewCard} from '../PreviewCard/PreviewCard';

import './FullscreenGallery.scss';

const b = block('card-fullscreen-gallery');

type FullscreenGalleryProps = {
    images: string[];
    initialImageIndex: number;
    onClose: () => void;
};

const calculateDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
};

const calculateCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
    };
};

// Minimum distance and velocity required for a swipe
const MIN_SWIPE_DISTANCE = 50;
const MIN_SWIPE_VELOCITY = 0.2; // pixels per millisecond

export function FullscreenGallery({images, initialImageIndex, onClose}: FullscreenGalleryProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialImageIndex);
    const [scale, setScale] = React.useState(1);
    const [translateX, setTranslateX] = React.useState(0);
    const [translateY, setTranslateY] = React.useState(0);
    const [isHorizontalOrientation, setIsHorizontalOrientation] = React.useState(false);
    const imageRef = React.useRef<HTMLDivElement>(null);
    const thumbnailRefs = React.useRef<(HTMLDivElement | null)[]>([]);

    // Detect orientation changes
    React.useEffect(() => {
        const checkOrientation = () => {
            setIsHorizontalOrientation(window.innerWidth > window.innerHeight);
        };

        checkOrientation();

        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    // Reset transform when changing images
    React.useEffect(() => {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);

        // Scroll active thumbnail into view when changing images
        if (thumbnailRefs.current[currentIndex]) {
            thumbnailRefs.current[currentIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [currentIndex]);

    // Touch gesture handling for pinch zoom and swipe
    const touchStartRef = React.useRef<{
        touches: React.Touch[];
        distance: number;
        centerX: number;
        centerY: number;
        startX: number;
        startY: number;
        initialTouchX?: number; // For horizontal swipe
        swipeStartTime?: number; // For swipe velocity calculation
    } | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch gesture start
            const distance = calculateDistance(e.touches[0], e.touches[1]);
            const center = calculateCenter(e.touches[0], e.touches[1]);

            touchStartRef.current = {
                touches: Array.from(e.touches),
                distance,
                centerX: center.x,
                centerY: center.y,
                startX: translateX,
                startY: translateY,
            };
        } else if (e.touches.length === 1) {
            if (scale > 1) {
                // Pan gesture start when zoomed in
                touchStartRef.current = {
                    touches: Array.from(e.touches),
                    distance: 0,
                    centerX: e.touches[0].clientX,
                    centerY: e.touches[0].clientY,
                    startX: translateX,
                    startY: translateY,
                };
            } else {
                // Horizontal swipe start when not zoomed in
                touchStartRef.current = {
                    touches: Array.from(e.touches),
                    distance: 0,
                    centerX: e.touches[0].clientX,
                    centerY: e.touches[0].clientY,
                    startX: translateX,
                    startY: translateY,
                    initialTouchX: e.touches[0].clientX,
                    swipeStartTime: Date.now(),
                };
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current) {
            return;
        }

        if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
            // Pinch gesture move (zoom)
            e.preventDefault();
            const newDistance = calculateDistance(e.touches[0], e.touches[1]);
            const newScale = Math.max(
                1,
                Math.min(3, (scale * newDistance) / touchStartRef.current.distance),
            );

            setScale(newScale);
        } else if (e.touches.length === 1 && scale > 1) {
            // Pan gesture move when zoomed in
            e.preventDefault();
            const dx = e.touches[0].clientX - touchStartRef.current.centerX;
            const dy = e.touches[0].clientY - touchStartRef.current.centerY;

            setTranslateX(touchStartRef.current.startX + dx);
            setTranslateY(touchStartRef.current.startY + dy);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (
            touchStartRef.current &&
            touchStartRef.current.initialTouchX !== undefined &&
            scale === 1
        ) {
            // Handle horizontal swipe
            const touchEndX = e.changedTouches[0]?.clientX;
            const touchStartX = touchStartRef.current.initialTouchX;
            const swipeDistance = touchEndX - touchStartX;
            const swipeTime = Date.now() - (touchStartRef.current.swipeStartTime || 0);

            // Calculate swipe velocity (pixels per millisecond)
            const swipeVelocity = Math.abs(swipeDistance) / swipeTime;

            if (
                Math.abs(swipeDistance) > MIN_SWIPE_DISTANCE &&
                swipeVelocity > MIN_SWIPE_VELOCITY
            ) {
                if (swipeDistance > 0 && currentIndex > 0) {
                    // Swipe right -> previous image
                    setCurrentIndex(currentIndex - 1);
                } else if (swipeDistance < 0 && currentIndex < images.length - 1) {
                    // Swipe left -> next image
                    setCurrentIndex(currentIndex + 1);
                }
            }
        }

        touchStartRef.current = null;
    };

    const handleDoubleTap = () => {
        if (scale > 1) {
            // Reset zoom
            setScale(1);
            setTranslateX(0);
            setTranslateY(0);
        } else {
            // Zoom to 2x
            setScale(2);
        }
    };

    return (
        <div className={b()}>
            <div className={b('header')}>
                <Button view="flat" onClick={onClose}>
                    <Button.Icon>
                        <Icon data={Xmark} />
                    </Button.Icon>
                </Button>
            </div>

            <div
                className={b('content')}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={handleDoubleTap}
                ref={imageRef}
            >
                <div
                    className={b('image-container')}
                    style={{
                        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                    }}
                >
                    <AsyncImage
                        className={b('image')}
                        showSkeleton={true}
                        src={images[currentIndex]}
                    />
                </div>
            </div>

            <div className={b('controls')}>
                <Flex gap={4} overflow="y" className={spacing({py: 2})}>
                    {images.map((image, i) => (
                        <PreviewCard
                            key={i}
                            selected={i === currentIndex}
                            onSelected={() => setCurrentIndex(i)}
                            image={image}
                            size={isHorizontalOrientation ? 'xs' : 's'}
                            ref={(element) => {
                                thumbnailRefs.current[i] = element;
                            }}
                        />
                    ))}
                </Flex>
            </div>
        </div>
    );
}
