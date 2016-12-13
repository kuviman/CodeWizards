import com.google.common.base.Function;
import com.google.common.io.LittleEndianDataOutputStream;
import com.google.common.math.DoubleMath;
import com.google.gson.Gson;
import com.sun.javafx.geom.Vec2d;
import com.sun.javafx.geom.Vec3d;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import sun.misc.IOUtils;

import java.io.*;
import java.lang.reflect.Field;
import java.nio.ByteBuffer;
import java.util.*;

/**
 * Created by VitPro.
 */
public class ParserOBJ {
    static double xScale = 1, yScale = 1, zScale = 1;
    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Expected 2 args");
            return;
        }
        if (args.length >= 5) {
            xScale = 1 / Double.parseDouble(args[2]);
            yScale = 1 / Double.parseDouble(args[3]);
            zScale = 1 / Double.parseDouble(args[4]);
        }

        List<Vec3d> v = new ArrayList<>();
        List<Vec2d> vt = new ArrayList<>();
        List<Vec3d> vn = new ArrayList<>();

        LittleEndianDataOutputStream out = new LittleEndianDataOutputStream(new FileOutputStream(args[1]));

        //noinspection unchecked
        List<String> lines = FileUtils.readLines(new File(args[0]));
        for (String line : lines) {
            String[] tokens = StringUtils.split(line);
            if (tokens.length == 0) {
                continue;
            }
            if ("v".equals(tokens[0])) {
                v.add(convert(new Vec3d(
                        Double.parseDouble(tokens[1]),
                        Double.parseDouble(tokens[2]),
                        Double.parseDouble(tokens[3])), false));
            }
            if ("vt".equals(tokens[0])) {
                vt.add(new Vec2d(
                        Double.parseDouble(tokens[1]),
                        Double.parseDouble(tokens[2])));
            }
            if ("vn".equals(tokens[0])) {
                vn.add(convert(new Vec3d(
                        Double.parseDouble(tokens[1]),
                        Double.parseDouble(tokens[2]),
                        Double.parseDouble(tokens[3])), true));
            }

            if ("f".equals(tokens[0])) {
                for (int i = 1; i < 4; i++) {
                    String[] fv = StringUtils.split(tokens[i], '/');
                    int v_i = Integer.parseInt(fv[0]) - 1;
                    int vt_i = Integer.parseInt(fv[1]) - 1;
                    int vn_i = Integer.parseInt(fv[2]) - 1;

                    Vec3d curV = v.get(v_i);
                    Vec2d curVT = vt.get(vt_i);
                    Vec3d curVN = vn.get(vn_i);
                    out.writeFloat((float) curV.x);
                    out.writeFloat((float) curV.y);
                    out.writeFloat((float) curV.z);
                    out.writeFloat((float) curVN.x);
                    out.writeFloat((float) curVN.y);
                    out.writeFloat((float) curVN.z);
                    out.writeFloat((float) curVT.x);
                    out.writeFloat((float) curVT.y);
                }
            }
        }
        out.close();

        calculateBoundingBox(v, "x");
        calculateBoundingBox(v, "y");
        calculateBoundingBox(v, "z");
    }

    private static Vec3d convert(Vec3d vec3d, boolean norm) {
        vec3d.x *= xScale;
        vec3d.y *= yScale;
        vec3d.z *= zScale;
        if (norm) {
            vec3d.normalize();
        }
        return vec3d;
    }

    public static void calculateBoundingBox(List<Vec3d> v, String name) throws Exception {
        double minVal = Double.POSITIVE_INFINITY;
        double maxVal = Double.NEGATIVE_INFINITY;
        Field field = Vec3d.class.getField(name);
        for (Vec3d vec3d : v) {
            double cur = (double) field.get(vec3d);
            minVal = Math.min(minVal, cur);
            maxVal = Math.max(maxVal, cur);
        }
        System.out.println(name + ": " + minVal + " to " + maxVal);
    }
}
