#!/bin/bash

# Check if a name argument is provided
if [ -z "$1" ]; then
  echo "Please provide a base name for the module, controller, and service."
  exit 1
fi

mkdir src/$1


# Generate module, controller, and service
nest g mo $1
nest g co $1
nest g s $1
# Generate entity
mkdir src/$1/entities
touch src/$1/entities/$1.entity.ts
# Generate DTO
mkdir src/$1/dto  
touch src/$1/dto/create-$1.dto.ts
touch src/$1/dto/update-$1.dto.ts

echo "Module, controller, and service named $1 have been generated."