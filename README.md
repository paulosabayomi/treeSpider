# TreeSpider

<div align="center">
    <img src="https://github.com/paulosabayomi/treeSpider/blob/main/res/treeSpider.png" alt="TreeSpider logo" width="200" style="object-fit: contain; justify-self:center;"/>
</div>

<!-- [START BADGES] -->
<!-- Please keep comment here to allow auto update -->
<p align="center">
  <a href="https://github.com/paulosabayomi/treeSpider/blob/main/LICENSE"><img src="https://img.shields.io/github/license/paulosabayomi/treeSpider?style=flat-square" alt="MIT License" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/language-TypeScript-blue.svg?style=flat-square" alt="Language" /></a>
  <a href="https://github.com/paulosabayomi/treeSpider/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  <a href="https://github.com/paulosabayomi/treeSpider/actions/workflows/package.yml"><img src="https://github.com/paulosabayomi/treeSpider/actions/workflows/package.yml/badge.svg" alt="Package" /></a>
  <a href="https://github.com/paulosabayomi/treeSpider/actions/workflows/npm-publish.yml"><img src="https://github.com/paulosabayomi/treeSpider/actions/workflows/npm-publish.yml/badge.svg" alt="Publish to npm" /></a>
  <a href="https://github.com/paulosabayomi/treeSpider/actions/workflows/tests.yml"><img src="https://github.com/paulosabayomi/treeSpider/actions/workflows/tests.yml/badge.svg" alt="Tests" /></a>
</p>
<!-- [END BADGES] -->

Display your organization structure in style, personalize and use the chart type of your choice and that fits your organization, and more. Built with D3js and TypeScript.

## Installation

```bash
npm i treeSpider
```

## Setup

After installation you can either import treeSpider directly in your application or load it via the script tag, it has both ES6 and browser bundles.

### ES6 import

```ts
import TreeSpider from '/path/to/installation/folder/dist/es/treeSpider.bundle.min.js'

const instance1 = new TreeSpider({
    targetContainer: '#container-1'
})
```

### Browser

```html

<div id="container-1"></div>

<!-- .... --->
<script src="/path/to/installation/folder/dist/browser/treeSpider.bundle.min.js"></script>

<script>
    const instance1 = new TreeSpider({
        targetContainer: '#container-1'
    });
</script>

```

After importing it or loading it with the script tag, add the CSS file

```html
<link rel="stylesheet" href="/path/to/installation/folder/dist/css/treeSpider.css">
```

And that is it, you will see treeSpider running in the browser with random automatically generate data, and one cool thing is there is no limit to the number of TreeSpider instances that can be on a page, next add your organization employees data.

## Adding data

The treeSpider data structure is linear and simple, each employees has a parent ID which is the id of the **department head** to whom each employees reports to and the head of the organization doesn't have an ID, and it is required to have one and only one data that doesn't have a parent id which is going to serve as the head of the organization or the organization name in an organization where there's no particular person as the head, the data is an array in the following format

```ts
{
    id: string; 
    parentId: string; 
    name: string; 
    role: string; 
    location: string;
    image: string;
}
```

All properties of the data except the `id` are optional, but it is recommended that the name should contain at least one name either first and/or last name, check the documentation for more info on the properties.  
  
## Passing your organization data

This is an example of an organization's employees data

```ts
const tree_data = [
    {id: "1", name: "Abayomi Amusa", role: "Manager", location: "Lagos, Nigeria"},
    {id: "2", parentId: "1", name: "Trey Anderson", role: "Product Manager", location: "California, United States"},
    {id: "3", parentId: "1", name: "Troy Manuel", role: "Software Developer", location: "Alberta, Canada"},
    {id: "4", parentId: "1", name: "Rebecca Oslon", role: "Software Developer", location: "London, United Kingdom"},
    {id: "5", parentId: "1", name: "David Scheg", role: "Product Designer", location: "Jiaozian, China"},
    {id: "6", parentId: "2", name: "James Zucks", role: "DevOps", location: "Accra, Ghana"},
    {id: "7", parentId: "2", name: "Zu Po Xe", role: "Backend Developer", location: "Johanesburg, South Africa"},
    {id: "8", parentId: "2", name: "Scott Ziagler", role: "FrontEnd Developer Intern"},
    {id: "9", parentId: "7", name: "Xervia Allero", role: "FrontEnd Developer Intern"},
    {id: "10", parentId: "3", name: "Adebowale Ajanlekoko", role: "Fullstack Developer"},
]

const instance1 = new TreeSpider({
    targetContainer: '#container-1',
    tree_data: tree_data
})
```

This is going to display the employees data with the default settings, the default tree type, default chart head, default chart link and pallet and all of them can be set, changed or tuned to meet your need, see few of the options below. 

## Options

TreeSpider can be personalized to your taste, TreeSpider currently has 7 tree types including the default and 3 chart head types including the default, there is also a color pallet for the chart head for personalizing the chart head color. For example displaying the data with the `hSpiderWalk` tree and with the `landscape` chart head

```ts
const chart = new TreeSpider({
    targetContainer: '#chart-container',
    tree_data: tree_data
    chart_head_type: 'landscape',
    tree_type: 'hSpiderWalk'
    pallet: {
        darker: .8,
        gray: 10
    },
    // random_data_length: 500, // set the number of random automatically generated employee data
})
```

See the options documentation for a list of all the options.

## Methods

TreeSpider has methods for programatically interracting with it, example, the method to programatically initialize the library.

```ts
const chart = new TreeSpider({
    // ...
    autoInitialize: false
})

document.querySelector('#random-button').onclick = () => chart.initialize()
```

The `autoInitialize` option tells TreeSpider to not initilize by default and it gets initialized once the `initialize` method has been called.  
  
See the Methods documentation for all the available methods.

## Events

Events can be subscribed to with the `addEventListener` or with the `on` method, example

```ts
const chart = new TreeSpider({
    //...
})

// using the `on` method
chart.on('library.init', (e) => {
    console.log("the library has been initialized", e)
})

// using the addEventListener
chart.on('chart_head.create', (e) => {
    console.log("a chart head has been created", e)
})

```

See the documentation for more.

## License

[MIT](https://github.com/paulosabayomi/treeSpider/blob/main/README.md)  
  
Created with :heart: by Abayomi Amusa
