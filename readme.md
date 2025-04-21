<p align="center">
    <img src="./docs/logo/logo.png" width="200" />
    <h1 align="center">Thermax AI Studio</h1>
</p>

AI studio is a collection of services provided for Thermax.

## Table Of Content

* [1. Services](#Services)
    * [1. 1 Sales Enablement Tool](#SalesEnablementTool)
* [2. Architecture Design](#ArchitectureDesign)
* [3. Database Design](#DatabaseDesign)
* [4. API Specification](#ApiSpecification)
* [5. UX Design](#UXDesign)
* [6. Local Development](#LocalDevelopment)
    * [6.1 Commit Standard](#CommitStandard)

## <a name='Services'></a>1. Services

### <a name='SalesEnablementTool'></a>1.1 Sales Enablement Tool

A quesion answering system for the sales team.
Answers are pulled different products and each product can have the following sources.
- Brochure (PDF)
- Manual (PDF)
- Technical Specifical (Excel)

Note: There can be multiple manuals and Technical specifical for a single product based on model type.

## <a name='ArchitectureDesign'></a>2. Architecture Design

![Architecture Design](/docs/architecture_design/architecture.png)

## <a name='DatabaseDesign'></a>3. Database Design

![Database Design](/docs/database_design/database_design.png)

Note: Tables for corresponding services are prefixed.

1. `Sales Enablement Tool` is prefixed with `sale_`

## <a name='ApiSpecification'></a>4. API Specification

A high level API Specification can be found in the document mentioned below.

[API Specification](/docs/api_specification/api_specification.md)

## <a name='UXDesign'></a>5. UX Design

Application is designed using Figma. It is stored on git-lfs. First you will have to install git lfs based on the operating system. 

```
sudo apt-get install git-lfs
git lfs install
```

You can pull all git lfs files using the following command.

```
git lfs pull
```

Note: Since we are using free account github only provides 2GB for storing large files.

Both figma file and PDF for the screen is tracked using the command

```
git lfs track "*.fig"
git lfs track "*.pdf"
```

 To see the files already tracked by GIT LFS
 
 ```
 git lfs ls-files
 ```

## <a name='LocalDevelopment'></a>6. Local Development

From the project root directory, you can run the following commands.

To see all the supported commands
```
make help
```

To build and run the project
```
make build
make up
```

To see the logs
```
make logs
```

### <a name='CommitStandard'></a>6.1 Commit Standard

The conventional commit message style is another way you can level up your commit messages. The conventional commits structure involves starting your commit message with a specified commit type. Commit types include:
- `feat` – feature
- `fix` – bug fixes
- `docs` – changes to the documentation like README
- `style` – style or formatting change
- `perf` – improves code performance
- `test` – test a feature
