---
sidebar_position: 2
title: Register New Patient
---

# Registering a New Patient

After a sussessful login :

Within a facility there are patients who came to the facility for the first time to get service

To register a new patient 
- You first click the `Registration` application as shown in the figure below
     
     ![img alt](/img/new_patient1.png)

- After clicking the registration application it will redidirect to another page in which to register a new patient you click a **`Register New Patient`**  button which will open a form for capturing details of the patient

     ![img alt](/img/new_patient2.png)

- The form loaded will contain several fields in which they aim to collect details about the patient to be registered, these fields are into groups / sections 

1 INDENTIFICATION
   This contain a MRN field (Medical Registration Number) which is auto generated but configurable to identify the identity of the facility
   this field is called `MRN`

    
   Also there is an option to add other identification in which a patient have these includes
    - Driving License 
    - Employee ID
    - National ID 
    - Passport Number
    - Voting Registration ID
  



- **previous/next navigation**
- **versioning**

## Create your first Doc

Create a markdown file at `docs/hello.md`:

```md title="docs/hello.md"
# Hello

This is my **first Docusaurus document**!
```

A new document is now available at `http://localhost:3000/docs/hello`.

## Configure the Sidebar

Docusaurus automatically **creates a sidebar** from the `docs` folder.

Add metadatas to customize the sidebar label and position:

```md title="docs/hello.md" {1-4}
---
sidebar_label: 'Hi!'
sidebar_position: 3
---

# Hello

This is my **first Docusaurus document**!
```

It is also possible to create your sidebar explicitly in `sidebars.js`:

```diff title="sidebars.js"
module.exports = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Tutorial',
-     items: [...],
+     items: ['hello'],
    },
  ],
};
```
