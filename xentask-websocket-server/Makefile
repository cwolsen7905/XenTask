# Application Makefile (C) 2024 Christopher W. Olsen

#Binary File Name
BINARY = wss

#Delete Program
REMOVE = rm -f

# Directories
OBJ_DIR = obj
SRC_DIR = src
BIN_DIR = bin

SRC := $(wildcard $(SRC_DIR)/*.c)

#Objects
OBJS := $(SRC:$(SRC_DIR)/%.c=$(OBJ_DIR)/%.o)

INCLUDES = -I./include

LIBRARIES =  -lssl -lcrypto

BINARY := $(BIN_DIR)/$(BINARY)

# Link The Binary
$(BINARY) : $(OBJS) | $(BIN_DIR)
	$(CC) $(CFLAGS) -o $@ $(LIBRARIES) $(OBJS)
	#strip $(BINARY)

# Compile the source files
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

$(BIN_DIR) $(OBJ_DIR):
	mkdir -p $@
 
# Clean Up The junk
clean:
	$(REMOVE) $(OBJS) $(BUILD_DIR)/bin/$(BINARY)
