# Snitcher

**This is an example project!**
I wrote this while I'm studying book *Node.js Design Patterns*
This program demonstrates different async control flow using callbacks
(sequential iteration, parallel execution, limited parallel execution)

# What does it do?

Program read the file containing links on web resources. For each link it counts the words occurrence and
save this statistics to the file

# Installation

```sh
$ npm ci
$ npm i -g
```

# Usage

1. Create a file containing links you want to process (I called it links.txt)

```
https://nodejs.org/en
https://github.com/w111zard/snitcher
https://www.npmjs.com/package/chalk
```

2. Run the program

```sh
$ snitcher links.txt
```

Output may look like:
```sh
[INFO]: 🚀 Started using sequential iteration pattern
[INFO]: 🛠 Processing: https://nodejs.org/en...
[SUCCESS]: ✅ https://nodejs.org/en
[INFO]: 🛠 Processing: https://github.com/w111zard/snitcher...
[SUCCESS]: ✅ https://github.com/w111zard/snitcher
[INFO]: 🛠 Processing: https://www.npmjs.com/package/chalk...
[SUCCESS]: ✅ https://www.npmjs.com/package/chalk
[SUCCESS]: 🏁 Done!
```

And you should see files with the result in you cwd:
```
$ ls
```

My output:
```sh
1727450251911.json  1727450253025.json  1727450253430.json  links.txt
```

The files with timestamp in name contain results. Let's open one of them.
The result may look like:

```json
{
  "resource": "https://github.com/w111zard/snitcher",
  "statistics": [
    {
      "to": 9
    },
    {
      "security": 7
    },
    {
      "in": 6
    }
  ]
}
```