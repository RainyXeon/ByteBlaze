import fs from "fs"

export default (path: string) => {
  const res_array: string[] = []

  const res = fs.readFileSync(path, "utf-8")

  res.split(/\r?\n/).forEach(function (line) {
    res_array.push(line)
  })

  return res_array
}
