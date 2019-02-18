from PIL import Image
import piexif
import io
import codecs

o = io.BytesIO()
f = open("stonehenge.jpg", 'rb')
thumb_im = Image.open(f)
thumb_im.save(o, "jpeg")
thumbnail = o.getvalue()


exif_blockchain = {piexif.ExifIFD.UserComment: "BlockchainID".encode('utf-8')}
exif_dict = {"Exif": exif_blockchain}
exif_bytes = piexif.dump(exif_dict)
piexif.insert(exif_bytes, "stonehenge.jpg")
# print(piexif.load("stonehenge.jpg"))

