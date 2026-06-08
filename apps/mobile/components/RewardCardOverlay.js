import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Image, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function RewardCardOverlay({ visible, animal, imageSource, onComplete }) {
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const collect = useRef(new Animated.Value(0)).current;
  const [isFaceUp, setIsFaceUp] = useState(false);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
      onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        Animated.spring(drag, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          tension: 75,
          useNativeDriver: true
        }).start();
      }
    }),
    [drag]
  );

  useEffect(() => {
    if (!visible) return;
    setIsFaceUp(false);
    drag.setValue({ x: 0, y: 0 });
    entrance.setValue(0);
    flip.setValue(0);
    sparkle.setValue(0);
    collect.setValue(0);
    Animated.spring(entrance, {
      toValue: 1,
      friction: 6,
      tension: 85,
      useNativeDriver: true
    }).start();
  }, [collect, drag, entrance, flip, sparkle, visible]);

  if (!visible || !animal) return null;

  const frontRotation = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const backRotation = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const enterScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.56, 1] });
  const enterTranslateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [screenHeight * 0.28, 0] });
  const collectScale = collect.interpolate({ inputRange: [0, 1], outputRange: [1, 0.18] });
  const collectX = collect.interpolate({ inputRange: [0, 1], outputRange: [0, screenWidth * 0.35] });
  const collectY = collect.interpolate({ inputRange: [0, 1], outputRange: [0, screenHeight * 0.32] });
  const collectOpacity = collect.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] });

  function handlePress() {
    if (!isFaceUp) {
      setIsFaceUp(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      Animated.parallel([
        Animated.spring(flip, { toValue: 1, friction: 7, tension: 75, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(sparkle, { toValue: 1, duration: 520, useNativeDriver: true }),
          Animated.timing(sparkle, { toValue: 0, duration: 260, useNativeDriver: true })
        ])
      ]).start();
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.parallel([
      Animated.spring(drag, { toValue: { x: 0, y: 0 }, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(collect, { toValue: 1, duration: 620, useNativeDriver: true })
    ]).start(() => onComplete?.());
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.cardStage,
          {
            opacity: collectOpacity,
            transform: [
              { translateX: Animated.add(drag.x, collectX) },
              { translateY: Animated.add(Animated.add(drag.y, enterTranslateY), collectY) },
              { scale: Animated.multiply(enterScale, collectScale) },
              { rotate: drag.x.interpolate({ inputRange: [-160, 0, 160], outputRange: ["-10deg", "0deg", "10deg"], extrapolate: "clamp" }) }
            ]
          }
        ]}
      >
        <Pressable onPress={handlePress} style={styles.pressArea}>
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ perspective: 900 }, { rotateY: backRotation }] }]}>
            <Text style={styles.backIcon}>?</Text>
            <Text style={styles.backTitle}>Nytt djur</Text>
            <Text style={styles.backHint}>Dutta för att vända</Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardFront, { transform: [{ perspective: 900 }, { rotateY: frontRotation }] }]}>
            <Image source={imageSource} style={styles.image} resizeMode="contain" />
            <Text style={styles.name}>{animal.name}</Text>
            <Text numberOfLines={2} style={styles.description}>{animal.description}</Text>
            <Text style={styles.frontHint}>Dutta igen för att lägga i biblioteket</Text>
          </Animated.View>

          <Sparkles progress={sparkle} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function Sparkles({ progress }) {
  const sparkles = [
    { text: "✦", x: -118, y: -132, size: 28 },
    { text: "✶", x: 108, y: -110, size: 22 },
    { text: "★", x: -96, y: 112, size: 20 },
    { text: "✧", x: 114, y: 92, size: 26 },
    { text: "✦", x: 0, y: -164, size: 18 }
  ];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {sparkles.map((item, index) => (
        <Animated.Text
          key={`${item.text}-${index}`}
          style={[
            styles.sparkle,
            {
              fontSize: item.size,
              opacity: progress.interpolate({ inputRange: [0, 0.2, 0.78, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, item.x] }) },
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, item.y] }) },
                { scale: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.2, 1.15, 0.7] }) },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }
              ]
            }
          ]}
        >
          {item.text}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  cardStage: {
    width: 256,
    height: 360,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 20
  },
  pressArea: {
    flex: 1
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 3,
    backfaceVisibility: "hidden",
    overflow: "hidden"
  },
  cardBack: {
    justifyContent: "center",
    backgroundColor: "#214038",
    borderColor: "#ffcf4d"
  },
  cardFront: {
    padding: 16,
    backgroundColor: "#fffdf2",
    borderColor: "#5bbd6a"
  },
  backIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    backgroundColor: "#ffcf4d",
    color: "#18332c",
    fontSize: 78,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 108
  },
  backTitle: {
    marginTop: 22,
    color: "#fffbe8",
    fontSize: 28,
    fontWeight: "900"
  },
  backHint: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "800"
  },
  image: {
    width: 216,
    height: 216,
    borderRadius: 22,
    backgroundColor: "#fff8e6"
  },
  name: {
    marginTop: 12,
    color: "#1f352f",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.2,
    textAlign: "center"
  },
  description: {
    marginTop: 6,
    color: "#52615d",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center"
  },
  frontHint: {
    marginTop: "auto",
    color: "#2f7668",
    fontSize: 12,
    fontWeight: "900"
  },
  sparkle: {
    position: "absolute",
    left: 118,
    top: 168,
    color: "#ffcf4d",
    textShadowColor: "rgba(255,255,255,0.95)",
    textShadowRadius: 10
  }
});
