import com.google.gson.Gson;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import sun.misc.IOUtils;

import java.io.File;
import java.io.PrintWriter;
import java.util.*;

/**
 * Created by VitPro.
 */
public class ParserOBJ {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("Expected 2 args");
            return;
        }

        Model model = new Model();

        //noinspection unchecked
        List<String> lines = FileUtils.readLines(new File(args[0]));
        for (String line : lines) {
            String[] tokens = StringUtils.split(line);
            if (tokens.length == 0) {
                continue;
            }
            if ("v".equals(tokens[0])) {
                model.v.add(Double.parseDouble(tokens[1]));
                model.v.add(Double.parseDouble(tokens[2]));
                model.v.add(Double.parseDouble(tokens[3]));
            }

            if ("f".equals(tokens[0])) {
                for (int i = 1; i < 4; i++) {
                    String[] fv = StringUtils.split(tokens[i], '/');
                    model.f_v.add(Integer.parseInt(fv[0]) - 1);
                }
            }
        }

        FileUtils.writeStringToFile(new File(args[1]), new Gson().toJson(model));
    }
}
