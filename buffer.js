// let result = '["\\n�\\u0002\\n�\\u0002\\n@9616bbdfc02396e01ad343cb86d959cf8392dd26a9bf27184403a107c072f36f\\u0012�\\u0001{\\"idImagen\\":\\"stonehenge\\",\\"hashImagen\\":\\"hash\\",\\"newOwner\\":\\"User2\\",\\"license\\":{\\"adapt\\":true,\\"diminish\\":false,\\"embed\\":false,\\"enhance\\":true,\\"enlarge\\":true,\\"issue\\":false,\\"modify\\":true,\\"play\\":true,\\"print\\":false,\\"reduce\\":true}}\\u001a\\f\\b����\\u0005\\u0010�ғ�\\u0003\\u001a$8f759b31-f593-4b72-87c1-4af52f4375e8"]'
// console.log(result)
// let regex = new RegExp('\\{.*\\:\\{.*\\:.*\\}\\}', 'g');
// let mystring = regex.exec(result);
// console.log(mystring)
// console.log(JSON.parse(mystring[0]))
let json = '{\\"idImagen\\":\\"stonehenge\\",\\"hashImagen\\":\\"hash\\",\\"newOwner\\":\\"User2\\",\\"license\\":{\\"adapt\\":true,\\"diminish\\":false,\\"embed\\":false,\\"enhance\\":true,\\"enlarge\\":true,\\"issue\\":false,\\"modify\\":true,\\"play\\":true,\\"print\\":false,\\"reduce\\":true}}'
console.log(json.toString())
let json2 = json.toString()
console.log(JSON.parse(json2))
