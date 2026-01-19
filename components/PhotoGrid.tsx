import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 3;

interface PhotoGridProps {
  photos: string[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePhotoPress = (photo: string, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedPhoto(photos[selectedIndex - 1]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedPhoto(photos[selectedIndex + 1]);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item, index) => `${item}-${index}`}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.photoContainer}
            onPress={() => handlePhotoPress(item, index)}
          >
            <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
          </Pressable>
        )}
        contentContainerStyle={styles.grid}
      />

      {/* Fullscreen Modal */}
      <Modal
        visible={!!selectedPhoto}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.closeArea} onPress={() => setSelectedPhoto(null)}>
            <View style={styles.modalHeader}>
              <Text style={styles.photoCounter}>
                {selectedIndex + 1} / {photos.length}
              </Text>
              <Pressable onPress={() => setSelectedPhoto(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
          </Pressable>

          <View style={styles.imageContainer}>
            {selectedIndex > 0 && (
              <Pressable style={styles.navButtonLeft} onPress={handlePrevious}>
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
            )}

            <Image
              source={{ uri: selectedPhoto || "" }}
              style={styles.fullImage}
              resizeMode="contain"
            />

            {selectedIndex < photos.length - 1 && (
              <Pressable style={styles.navButtonRight} onPress={handleNext}>
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    gap: 4,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  closeArea: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoCounter: {
    color: "#ffffff",
    fontSize: 16,
  },
  closeButton: {
    color: "#ffffff",
    fontSize: 24,
    padding: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: width,
    height: width,
  },
  navButtonLeft: {
    position: "absolute",
    left: 10,
    top: "50%",
    marginTop: -30,
    width: 50,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  navButtonRight: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginTop: -30,
    width: 50,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  navButtonText: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "300",
  },
});