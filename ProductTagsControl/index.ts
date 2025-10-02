import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "./css/ProductTagsControl.css";

interface WebAPIResponse {
    entities: Record<string, unknown>[];
}

export class ProductTagsControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private tagsContainer: HTMLDivElement;
    private input: HTMLInputElement;
    private errorMessage: HTMLDivElement;
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<IInputs>;
    private tags: string[] = [];
    private allKeywords = new Set<string>();

    constructor() {
        // No initialization needed
    }

    private async fetchKeywords(): Promise<void> {
        const tableName = this.context.parameters.tableName.raw;
        const keywordsField = this.context.parameters.keywordsField.raw;
        
        if (!tableName || !keywordsField) return;

        try {
            // Fetch records from the specified table
            const records = await this.context.webAPI.retrieveMultipleRecords(
                tableName,
                `?$select=${keywordsField}`
            );

            // Clear existing keywords
            this.allKeywords.clear();

            // Process each record and add keywords to the set
            records.entities.forEach(record => {
                if (record[keywordsField]) {
                    const keywords = (record[keywordsField] as string).split(',')
                        .map(k => k.trim().toLowerCase())
                        .filter(k => k.length > 0);
                    keywords.forEach(k => this.allKeywords.add(k));
                }
            });
        } catch (error) {
            console.error('Error fetching keywords:', error);
            this.showError('Error fetching keywords from the specified table');
        }
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        this.container = container;

        // Create main container for tags
        this.tagsContainer = document.createElement("div");
        this.tagsContainer.className = "tags-container";

        // Create input field
        this.input = document.createElement("input");
        this.input.className = "tags-input";
        this.input.placeholder = "Type and press Enter to add tags";
        this.input.addEventListener("keydown", this.handleInputKeyDown.bind(this));

        // Create error message element
        this.errorMessage = document.createElement("div");
        this.errorMessage.className = "error-message";
        
        // Add elements to container
        this.tagsContainer.appendChild(this.input);
        this.container.appendChild(this.tagsContainer);
        this.container.appendChild(this.errorMessage);

        // Initialize existing tags if any
        if (context.parameters.tagsField.raw) {
            this.tags = context.parameters.tagsField.raw.split(",").map(tag => tag.trim()).filter(tag => tag);
            this.renderTags();
        }
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    private handleInputKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            event.preventDefault();
            const value = this.input.value.trim();
            if (value) {
                this.validateAndAddTag(value);
                this.input.value = "";
            }
        }
    }

    private async validateAndAddTag(tag: string): Promise<void> {
        // If keywords haven't been loaded yet, fetch them first
        if (this.allKeywords.size === 0) {
            await this.fetchKeywords();
        }

        const isValid = this.allKeywords.has(tag.toLowerCase());
        
        if (isValid) {
            if (!this.tags.includes(tag)) {
                this.tags.push(tag);
                this.renderTags();
                this.notifyOutputChanged();
            }
            this.showError("");
        } else {
            this.showError("Product not found with the specified keyword");
        }
    }

    private renderTags(): void {
        // Clear existing tags
        while (this.tagsContainer.firstChild) {
            if (this.tagsContainer.firstChild === this.input) break;
            this.tagsContainer.removeChild(this.tagsContainer.firstChild);
        }

        // Add tags before the input
        this.tags.forEach((tag, index) => {
            const tagElement = document.createElement("div");
            tagElement.className = "tag";
            tagElement.textContent = tag;

            const removeButton = document.createElement("span");
            removeButton.className = "tag-remove";
            removeButton.innerHTML = "×";
            removeButton.onclick = () => this.removeTag(index);

            tagElement.appendChild(removeButton);
            this.tagsContainer.insertBefore(tagElement, this.input);
        });
    }

    private removeTag(index: number): void {
        this.tags.splice(index, 1);
        this.renderTags();
        this.notifyOutputChanged();
    }

    private showError(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.className = message ? "error-message visible" : "error-message";
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;
    }

    public getOutputs(): IOutputs {
        return {
            tagsField: this.tags.join(",")
        };
    }

    public destroy(): void {
        this.input.removeEventListener("keydown", this.handleInputKeyDown.bind(this));
    }
}
