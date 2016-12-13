import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

/**
 * Created by VitPro.
 */
public class AlphaMapApplier {
    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            System.err.println("3 args expected");
            return;
        }

        BufferedImage img = ImageIO.read(new File(args[0]));
        BufferedImage alpha = ImageIO.read(new File(args[1]));
        BufferedImage result = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_INT_ARGB);
        for (int x = 0; x < img.getWidth(); x++) {
            for (int y = 0; y < img.getHeight(); y++) {
                result.setRGB(x, y, (img.getRGB(x, y) & 0xffffff) | ((alpha.getRGB(x, y) & 0xff) << 24));
            }
        }
        ImageIO.write(result, "PNG", new File(args[2]));
    }
}
