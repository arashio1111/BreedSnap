package com.projectapp;
import android.graphics.Bitmap;
import java.nio.ByteBuffer;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.support.common.TensorOperator;
import org.tensorflow.lite.support.common.TensorProcessor;
import org.tensorflow.lite.support.common.ops.NormalizeOp;
import java.io.IOException;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.io.FileInputStream;
import java.io.File;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import java.nio.ByteOrder;

public class TFLiteModule extends ReactContextBaseJavaModule {
    private static final float IMAGE_MEAN = 0f;
    private static final float IMAGE_STD = 1.0f;

    private Interpreter tflite;

    public TFLiteModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TFLite";
    }

    private MappedByteBuffer loadModelFile(String modelPath) throws IOException {
        File file = new File(modelPath);
        FileInputStream inputStream = new FileInputStream(file);
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = 0;
        long declaredLength = fileChannel.size();
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
    }
    

    private TensorProcessor getPreprocessNormalizeOp() {
        return new TensorProcessor.Builder().add(new NormalizeOp(IMAGE_MEAN, IMAGE_STD)).build();
    }

    @ReactMethod
    
    public void runModelOnImage(String modelPath, String imagePath, int labelNum,  Promise promise) {
        try {

            tflite = new Interpreter(loadModelFile(modelPath));
            // 1. Image preprocessing
            Bitmap bitmap = loadAndResizeImage(imagePath);
            int[] intValues = new int[224 * 224]; 
    
            // Convert the bitmap to a ByteBuffer
            ByteBuffer imgData = convertBitmapToByteBuffer(bitmap, intValues, IMAGE_MEAN, IMAGE_STD);
    
            // 2. Model prediction
            float[][] output = new float[1][labelNum];  // update outputSize based on your model output
            tflite.run(imgData, output);
    
            // 3. Output is directly returned as one-dimensional array
            float[] outputArray = output[0];
    
            // 4. Return the results
            WritableArray result = Arguments.createArray();
            for (float v : outputArray) {
                result.pushDouble(v);
            }
    
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private Bitmap loadAndResizeImage(String imagePath) throws IOException {
        // Load image
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = false;
        Bitmap src = BitmapFactory.decodeFile(imagePath, options);
    
        // Calculate scale factor
        int width = src.getWidth();
        int height = src.getHeight();
        float scaleWidth = ((float) 224) / width;
        float scaleHeight = ((float) 224) / height;
    
        // Create a matrix for the manipulation
        Matrix matrix = new Matrix();
        // Resize the bitmap
        matrix.postScale(scaleWidth, scaleHeight);
    
        // Recreate the new bitmap
        Bitmap resizedBitmap = Bitmap.createBitmap(src, 0, 0, width, height, matrix, false);
        src.recycle();
        return resizedBitmap;
    }

    private ByteBuffer convertBitmapToByteBuffer(Bitmap bitmap, int[] intValues, float IMAGE_MEAN, float IMAGE_STD) {
        ByteBuffer imgData = ByteBuffer.allocateDirect(4 * 224 * 224 * 3);
    
        imgData.order(ByteOrder.nativeOrder());
        bitmap.getPixels(intValues, 0, bitmap.getWidth(), 0, 0, bitmap.getWidth(), bitmap.getHeight());
    
        int pixel = 0;
        for (int i = 0; i < 224; ++i) {
            for (int j = 0; j < 224; ++j) {
                final int val = intValues[pixel++];
    
                imgData.putFloat((((val >> 16) & 0xFF) - IMAGE_MEAN) / 255.0f);
                imgData.putFloat((((val >> 8) & 0xFF) - IMAGE_MEAN) / 255.0f);
                imgData.putFloat(((val & 0xFF) - IMAGE_MEAN) / 255.0f);
            }
        }
        imgData.rewind();
        return imgData;
    }
    
    
}
