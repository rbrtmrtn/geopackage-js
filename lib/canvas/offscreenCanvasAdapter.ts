import { CanvasAdapter } from './canvasAdapter';
import { CanvasUtils } from './canvasUtils';
import { GeoPackageImage } from '../image/geoPackageImage';
import { ImageType } from '../image/imageType';
import { ImageFormatEnumValues } from '../../@types/canvaskit';

/**
 * OffscreenCanvas canvas adapter. This can only run inside a web worker.
 */
export class OffscreenCanvasAdapter implements CanvasAdapter {
  private static initialized = false;

  initialize(): Promise<void> {
    return new Promise(resolve => {
      OffscreenCanvasAdapter.initialized = true;
      resolve();
    });
  }

  isInitialized(): boolean {
    return OffscreenCanvasAdapter.initialized;
  }

  create(width: number, height: number): OffscreenCanvas {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return new OffscreenCanvas(width, height);
  }

  createImage(data: Uint8Array | Buffer | string | Blob, contentType = 'image/png'): Promise<GeoPackageImage> {
    return new Promise((resolve, reject) => {
      let blob;
      if (data instanceof Buffer || Object.prototype.toString.call(data) === '[object Uint8Array]') {
        blob = new Blob([data], { type: contentType });
      } else if (typeof data === 'string') {
        blob = new Blob([CanvasUtils.base64toUInt8Array(data.split(',')[1])], { type: contentType });
      } else {
        blob = data as Blob;
      }
      createImageBitmap(blob)
        .then(image => {
          resolve(new GeoPackageImage(image, image.width, image.height));
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  createImageData(width, height): ImageData {
    return new ImageData(width, height);
  }

  disposeCanvas(canvas: OffscreenCanvas): void {
    canvas = null;
  }

  measureText(context: any, fontFace: string, fontSize: number, text: string): number {
    context.save();
    context.font = fontSize + 'px' + (fontFace != null ? " '" + fontFace + "'" : '');
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    const width = context.measureText(text).width;
    context.restore();
    return width;
  }

  drawText(
    context: any,
    text: string,
    location: number[],
    fontFace: string,
    fontSize: number,
    fontColor: string,
  ): void {
    context.save();
    context.font = fontSize + 'px' + (fontFace != null ? " '" + fontFace + "'" : '');
    context.fillStyle = fontColor;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText(text, location[0], location[1]);
    context.restore();
  }

  async scaleImage(image: GeoPackageImage, scale: number): Promise<GeoPackageImage> {
    if (scale === 1.0) {
      return image;
    }
    const scaledWidth = Math.round(scale * image.getWidth());
    const scaledHeight = Math.round(scale * image.getHeight());
    return this.scaleImageToDimensions(image, scaledWidth, scaledHeight);
  }

  async scaleImageToDimensions(
    image: GeoPackageImage,
    scaledWidth: number,
    scaledHeight: number,
  ): Promise<GeoPackageImage> {
    const canvas: any = this.create(scaledWidth, scaledHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image.getImage(), 0, 0, scaledWidth, scaledHeight);
    const result = new GeoPackageImage(canvas.transferToImageBitmap(), scaledWidth, scaledHeight);
    this.disposeCanvas(canvas);
    return result;
  }

  toDataURL(canvas: any, format = 'image/png', compressionQuality?: number): Promise<string> {
    return new Promise(resolve => {
      canvas.convertToBlob({ type: format, quality: compressionQuality }).then(blob => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const result: string = reader.result as string;
          resolve(result);
        });
        reader.readAsDataURL(blob);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disposeImage(image: GeoPackageImage): void {}

  /**
   * Write image to bytes
   * @param image
   * @param imageFormat
   * @param compressionQuality
   */
  writeImageToBytes(image: GeoPackageImage, imageFormat: ImageType, compressionQuality?: number): Promise<Uint8Array> {
    return new Promise(resolve => {
      const canvas: any = this.create(image.getWidth(), image.getHeight());
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image.getImage(), 0, 0);
      if (imageFormat === ImageType.TIFF) {
        // TODO: do something different
      }
      this.toBytes(canvas, imageFormat, compressionQuality);
    });
  }

  /**
   * Gets the image data
   */
  getImageData(image: GeoPackageImage): ImageData {
    const canvas: any = this.create(image.getWidth(), image.getHeight());
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image.getImage(), 0, 0);
    return ctx.getImageData(0, 0, image.getWidth(), image.getHeight());
  }

  /**
   * Draw content of fromCanvas into the toContext
   * @param fromCanvas
   * @param toContext
   */
  mergeCanvas(fromCanvas: any, toContext: any): void {
    toContext.drawImage(fromCanvas, 0, 0);
  }



  /**
   * Converts the contents drawn in a canvas to a byte array
   * @param canvas
   * @param imageFormat
   * @param compressionQuality
   * @return Uint8Array
   */
  toBytes(canvas: any, imageFormat: ImageType, compressionQuality?: number): Promise<Uint8Array> {
    return new Promise(resolve => {
      this.toDataURL(canvas, ImageType.getMimeType(imageFormat), compressionQuality).then(result => {
        resolve(CanvasUtils.base64toUInt8Array(result));
      });
    })
  }
}
