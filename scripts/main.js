import { pageContents } from "../data/pageContents.js";
import { defaultBasicRecipesData, defaultBuffetRecipesData, defaultFrenchRecipesData, defaultAllAdvancedRecipeData, defaultCreamsAndFillingsData, defaultFermentationSubmenuData } from "../data/recipes.js";

// --- LÓGICA PRINCIPAL DA APLICAÇÃO ---
let recipes = []; 

const recipeNav = document.getElementById('recipeNav');
const recipeContentDiv = document.getElementById('recipeContent'); 
const recipeContentContainer = document.getElementById('recipeContentContainer');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const sidebar = document.getElementById('sidebar');
const contentOverlay = document.getElementById('contentOverlay');

const printRecipeButton = document.getElementById('printRecipeButton');
const editRecipeButton = document.getElementById('editRecipeButton');
const saveRecipeChangesButton = document.getElementById('saveRecipeChangesButton');
const cancelEditButton = document.getElementById('cancelEditButton');
const downloadApostilaButton = document.getElementById('downloadApostilaButton'); 
const restoreDefaultRecipesButton = document.getElementById('restoreDefaultRecipesButton');

const flourCalculatorContainer = document.createElement('div');
      flourCalculatorContainer.id = 'flourCalculatorContainer';
      flourCalculatorContainer.classList.add('my-4', 'p-4', 'border', 'border-slate-300', 'rounded-md', 'bg-slate-50', 'no-print'); 

let currentRecipeForSaving = null; 
let currentRecipeOriginalData = null; 
let isEditMode = false;

function loadDefaultRecipes() {
    defaultBasicRecipesData.forEach(r => r.category = "basicos");
    defaultBuffetRecipesData.forEach(r => r.category = "buffet");
    defaultFrenchRecipesData.forEach(r => r.category = "franceses");
    defaultAllAdvancedRecipeData.forEach(r => r.category = "avancados");
    defaultCreamsAndFillingsData.forEach(r => { r.category = "cremes_recheios"; r.type = "page"; });

    recipes = [
        ...JSON.parse(JSON.stringify(defaultBasicRecipesData)), 
        ...JSON.parse(JSON.stringify(defaultBuffetRecipesData)),
        ...JSON.parse(JSON.stringify(defaultFrenchRecipesData)),
        ...JSON.parse(JSON.stringify(defaultAllAdvancedRecipeData)),
        ...JSON.parse(JSON.stringify(defaultCreamsAndFillingsData)) 
    ];
}

const defaultFermentationSubmenuData = [ 
    { name: "Levain (Fermento Natural)", contentKey: "levain_content", category: "fermentacao_submenu", type: "page" },
    { name: "Biga", contentKey: "biga_content", category: "fermentacao_submenu", type: "page" },
    { name: "Poolish", contentKey: "poolish_content", category: "fermentacao_submenu", type: "page" },
    { name: "Pâte Fermentée (Massa Velha)", contentKey: "pate_fermentee_content", category: "fermentacao_submenu", type: "page" },
    { name: "Esponja", contentKey: "esponja_content", category: "fermentacao_submenu", type: "page" }
];

function initializeRecipes() {
    const storedRecipes = localStorage.getItem('apostilaPãesRecipes');
    if (storedRecipes) {
        try {
            recipes = JSON.parse(storedRecipes);
            const hasPageCategories = recipes.some(r => (r.category === 'cremes_recheios' || r.category === 'fermentacao_submenu') && r.type === 'page');
            if (!hasPageCategories && (defaultCreamsAndFillingsData.length > 0 || defaultFermentationSubmenuData.length > 0) ) { 
                console.log("LocalStorage antigo detectado ou sem categorias de página, recarregando defaults.");
                loadDefaultRecipes();
                saveRecipesToLocalStorage(); 
            } else {
                 console.log("Receitas carregadas do localStorage.");
            }
        } catch (e) {
            console.error("Erro ao carregar/parsear receitas do localStorage:", e);
            loadDefaultRecipes(); 
        }
    } else {
        loadDefaultRecipes();
        console.log("Nenhuma receita salva localmente. Carregando receitas padrão.");
    }
}

function saveRecipesToLocalStorage() {
    try {
        localStorage.setItem('apostilaPãesRecipes', JSON.stringify(recipes));
        console.log("Receitas salvas no localStorage.");
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
        alert("Erro ao salvar localmente. Verifique as permissões do navegador ou se o localStorage está cheio.");
    }
}

restoreDefaultRecipesButton.addEventListener('click', () => {
    if (confirm("Tem certeza que deseja restaurar todas as receitas para o padrão original? Todas as alterações salvas localmente serão perdidas.")) {
        localStorage.removeItem('apostilaPãesRecipes');
        loadDefaultRecipes(); 
        populateNav(); 
        recipeContentDiv.innerHTML = '<p class="text-lg text-center text-slate-500">Receitas restauradas para o padrão. Selecione uma receita ou seção ao lado para começar.</p>';
        printRecipeButton.style.display = 'none';
        editRecipeButton.style.display = 'none';
        saveRecipeChangesButton.style.display = 'none';
        cancelEditButton.style.display = 'none';
        flourCalculatorContainer.style.display = 'none';
        restoreDefaultRecipesButton.style.display = 'none'; 
    }
});

downloadApostilaButton.addEventListener('click', () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    const filename = `Apostila_Atualizada_${formattedDate}.html`;
    
    const pageHtml = document.documentElement.outerHTML;
    const blob = new Blob([pageHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`Download da apostila iniciado como "${filename}".\n\nLembrete: Para que um amigo veja SUAS alterações, a melhor forma é: \n1. Salve suas alterações localmente aqui na apostila.\n2. Use a opção "Salvar Página Como..." do seu navegador para criar uma cópia do arquivo HTML. Essa cópia conterá suas alterações.`);
});

function setEditableState(isEditable) {
    isEditMode = isEditable; 
    
    const recipeDescDiv = recipeContentDiv.querySelector('#recipeDescription');
    const ingredientsTables = recipeContentDiv.querySelectorAll('table[data-section-key]');
    const instructionsOList = recipeContentDiv.querySelector('#instructionsList');
    const tipsUList = recipeContentDiv.querySelector('#tipsList');

    recipeContentDiv.querySelectorAll('.add-btn-container').forEach(c => c.remove());

    if (isEditable) {
        if (recipeDescDiv) {
            const currentText = recipeDescDiv.textContent || ""; 
            recipeDescDiv.innerHTML = `<textarea class="edit-mode-textarea" data-field="description">${currentText.trim()}</textarea>`;
        }

        ingredientsTables.forEach(table => {
            const sectionKey = table.dataset.sectionKey;
            const tbody = table.querySelector('tbody');
            if (!tbody) return;

            Array.from(tbody.rows).forEach(row => {
                if (row.cells.length < 3) return; 

                const itemText = row.cells[0].textContent.trim();
                const percentageText = row.cells[1].textContent.replace('%','').trim();
                const weightText = row.cells[2].textContent.trim();

                row.cells[0].innerHTML = `<input type="text" class="edit-mode-input" value="${itemText}">`;
                row.cells[1].innerHTML = `<input type="text" class="edit-mode-input" value="${percentageText}">`;
                row.cells[2].innerHTML = `<input type="text" class="edit-mode-input" value="${weightText}">`;
                
                if (row.cells.length === 3) { 
                    const removeBtnCell = row.insertCell(-1);
                    removeBtnCell.innerHTML = `<button class="remove-btn" title="Remover Ingrediente">🗑️</button>`;
                    removeBtnCell.querySelector('button').onclick = function() { this.closest('tr').remove(); };
                } else if (row.cells.length === 4 && !row.cells[3].querySelector('button')) {
                     row.cells[3].innerHTML = `<button class="remove-btn" title="Remover Ingrediente">🗑️</button>`;
                     row.cells[3].querySelector('button').onclick = function() { this.closest('tr').remove(); };
                }
            });
            const addBtnContainer = document.createElement('div'); 
            addBtnContainer.className = 'add-btn-container mt-2'; 
            addBtnContainer.innerHTML = `<button class="add-btn" data-section-key="${sectionKey}">+ Adicionar Ingrediente</button>`;
            table.insertAdjacentElement('afterend', addBtnContainer);
            addBtnContainer.querySelector('button').onclick = function() { addIngredientRow(this.dataset.sectionKey, tbody); };
        });

        if (instructionsOList) {
            Array.from(instructionsOList.children).forEach(li => {
                if (li.tagName === 'LI' && !li.classList.contains('edit-item-li')) { 
                    const currentText = li.textContent || "";
                    li.classList.add('edit-item-li');
                    li.innerHTML = `<textarea class="edit-mode-textarea">${currentText.trim()}</textarea><button class="remove-btn" title="Remover Instrução">🗑️</button>`;
                    li.querySelector('button').onclick = function() { this.closest('li').remove(); };
                }
            });
            const addInstructionBtnContainer = document.createElement('div');
            addInstructionBtnContainer.className = 'add-btn-container';
            addInstructionBtnContainer.innerHTML = `<button class="add-btn">+ Adicionar Instrução</button>`;
            instructionsOList.insertAdjacentElement('afterend', addInstructionBtnContainer);
            addInstructionBtnContainer.querySelector('button').onclick = function() { addListItem(instructionsOList, 'instruction'); };
        }
         if (tipsUList) {
            Array.from(tipsUList.children).forEach(li => {
                 if (li.tagName === 'LI' && !li.classList.contains('edit-item-li')) {
                    const currentText = li.textContent || "";
                    li.classList.add('edit-item-li');
                    li.innerHTML = `<textarea class="edit-mode-textarea">${currentText.trim()}</textarea><button class="remove-btn" title="Remover Dica">🗑️</button>`;
                    li.querySelector('button').onclick = function() { this.closest('li').remove(); };
                }
            });
            const addTipBtnContainer = document.createElement('div');
            addTipBtnContainer.className = 'add-btn-container';
            addTipBtnContainer.innerHTML = `<button class="add-btn">+ Adicionar Dica</button>`;
            tipsUList.insertAdjacentElement('afterend', addTipBtnContainer);
            addTipBtnContainer.querySelector('button').onclick = function() { addListItem(tipsUList, 'tip'); };
        }

        editRecipeButton.style.display = 'none';
        saveRecipeChangesButton.style.display = 'inline-flex';
        cancelEditButton.style.display = 'inline-flex';
        printRecipeButton.style.display = 'none'; 
        flourCalculatorContainer.style.display = 'none';
        restoreDefaultRecipesButton.style.display = 'none';
    } else { 
        if (currentRecipeForSaving) {
             displayRecipeDetail(currentRecipeForSaving); 
        }
    }
}

function addIngredientRow(sectionKey, tbody) {
    const newRow = tbody.insertRow(-1); 
    newRow.insertCell(0).innerHTML = `<input type="text" class="edit-mode-input" value="">`;
    newRow.insertCell(1).innerHTML = `<input type="text" class="edit-mode-input" value="">`;
    newRow.insertCell(2).innerHTML = `<input type="text" class="edit-mode-input" value="">`;
    const removeBtnCell = newRow.insertCell(3);
    removeBtnCell.innerHTML = `<button class="remove-btn" title="Remover Ingrediente">🗑️</button>`;
    removeBtnCell.querySelector('button').onclick = function() { this.closest('tr').remove(); };
}

function addListItem(listElement, type) {
    const newItem = document.createElement('li');
    newItem.classList.add('edit-item-li');
    newItem.innerHTML = `<textarea class="edit-mode-textarea"></textarea><button class="remove-btn" title="Remover ${type === 'instruction' ? 'Instrução' : 'Dica'}">🗑️</button>`;
    newItem.querySelector('button').onclick = function() { this.closest('li').remove(); };
    listElement.appendChild(newItem);
}

editRecipeButton.addEventListener('click', () => {
    if (currentRecipeForSaving) {
        currentRecipeOriginalData = JSON.parse(JSON.stringify(currentRecipeForSaving)); 
        setEditableState(true);
    }
});

cancelEditButton.addEventListener('click', () => {
    if (currentRecipeForSaving && currentRecipeOriginalData) {
        currentRecipeForSaving = JSON.parse(JSON.stringify(currentRecipeOriginalData));
        const recipeIndex = recipes.findIndex(r => r.name === currentRecipeOriginalData.name && r.category === currentRecipeOriginalData.category);
        if (recipeIndex !== -1) {
            recipes[recipeIndex] = JSON.parse(JSON.stringify(currentRecipeOriginalData));
        }
    }
    setEditableState(false); 
    currentRecipeOriginalData = null;
});

saveRecipeChangesButton.addEventListener('click', () => {
    if (currentRecipeForSaving) {
        saveRecipeChangesInMemory(currentRecipeForSaving); 
        saveRecipesToLocalStorage(); 
    }
    setEditableState(false); 
    currentRecipeOriginalData = null; 
});

function displayRecipeDetail(recipe) {
    currentRecipeForSaving = JSON.parse(JSON.stringify(recipe)); 
    isEditMode = false; 
    
    flourCalculatorContainer.innerHTML = ''; 
    
    printRecipeButton.style.display = 'none'; 
    editRecipeButton.style.display = 'none';
    saveRecipeChangesButton.style.display = 'none';
    cancelEditButton.style.display = 'none';
    flourCalculatorContainer.style.display = 'none';
    restoreDefaultRecipesButton.style.display = 'none';

    let recipeDescriptionHtml = `<div id="recipeDescription" class="text-slate-600 mb-6 italic p-2">${recipe.description || ''}</div>`;
    if (recipe.type === 'page') { 
        recipeContentDiv.innerHTML = pageContents[recipe.contentKey] || `<h2 class="page-title">${recipe.name}</h2><div id="recipeDescription">${recipe.description || 'Conteúdo em breve.'}</div>`;
        const oldAddButtons = recipeContentDiv.querySelectorAll('.add-btn-container');
        oldAddButtons.forEach(btn => btn.remove());
        return; 
    }

    editRecipeButton.style.display = 'inline-flex';
    printRecipeButton.style.display = 'inline-flex';
    flourCalculatorContainer.style.display = 'block';
    restoreDefaultRecipesButton.style.display = 'inline-flex';

    let totalOriginalFlourWeight = 0;
    let baseFlourSectionKey = 'finalDough'; 

    if (recipe.ingredients && recipe.ingredients.finalDough) {
        const baseFloursInFinalDough = recipe.ingredients.finalDough.filter(ing => ing.isBaseFlour || ing.isBaseFlourPart);
        if (baseFloursInFinalDough.length > 0) {
            totalOriginalFlourWeight = baseFloursInFinalDough.reduce((sum, ing) => {
                const weightMatch = String(ing.weightOriginal).match(/(\d+(\.\d+)?)/);
                return sum + (weightMatch ? parseFloat(weightMatch[0]) : 0);
            }, 0);
        }
    }
    
    flourCalculatorContainer.innerHTML = `
        <label for="totalFlourInput-${recipe.name.replace(/\s/g, '-')}" class="block text-sm font-medium text-slate-700">Peso Total da Farinha Base (g):</label>
        <div class="mt-1 flex rounded-md shadow-sm">
            <input type="number" id="totalFlourInput-${recipe.name.replace(/\s/g, '-')}" value="${totalOriginalFlourWeight > 0 ? totalOriginalFlourWeight.toFixed(0) : ''}" class="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-slate-300 p-2">
            <button id="recalculateButton-${recipe.name.replace(/\s/g, '-')}" class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 sm:text-sm">
                Recalcular Pesos
            </button>
        </div>`;
    
    if (recipeContentContainer && recipeContentDiv && !flourCalculatorContainer.parentElement) { 
         recipeContentContainer.insertBefore(flourCalculatorContainer, recipeContentDiv);
    }

    const recalculateButton = document.getElementById(`recalculateButton-${recipe.name.replace(/\s/g, '-')}`);
    if(recalculateButton) { 
        recalculateButton.addEventListener('click', () => updateIngredientWeights(currentRecipeForSaving, totalOriginalFlourWeight, baseFlourSectionKey));
    }
    
    let ingredientsHtml = '';
    if(recipe.ingredients) {
        Object.keys(recipe.ingredients).forEach(key => {
            const sectionName = getIngredientSectionName(key);
            const ingredientsList = recipe.ingredients[key];
            
            if (ingredientsList && ingredientsList.length > 0) {
                ingredientsHtml += `<h4 class="text-lg font-semibold mt-4 mb-2 text-slate-800">${sectionName}:</h4>
                                    <table data-section-key="${key}"><thead><tr><th>Item</th><th>% Padeiro</th><th>Peso (g)</th></tr></thead><tbody>`;
                ingredientsList.forEach((ing, index) => {
                    const percentageDisplay = (ing.percentage !== null && ing.percentage !== undefined) ? `${ing.percentage}` : '-'; 
                    const weightDisplay = ing.weightOriginal || ing.weight || '-'; 
                    ingredientsHtml += `<tr>
                                        <td>${ing.item}</td>
                                        <td>${percentageDisplay}</td>
                                        <td data-original-percentage="${ing.percentage}" data-is-base-flour-part="${ing.isBaseFlourPart || false}" data-is-pre-ferment="${ing.isPreFerment || false}" data-pre-ferment-flour-percentage="${ing.preFermentFlourPercentage || 0}">${weightDisplay}</td>
                                      </tr>`;
                });
                ingredientsHtml += '</tbody></table>';
            }
        });
    }

    let instructionsHtml = '<ol class="list-decimal list-inside space-y-2 text-slate-700" id="instructionsList">';
    (recipe.instructions || []).forEach((step) => { 
        instructionsHtml += `<li>${step}</li>`; 
    });
    instructionsHtml += '</ol>';

    let tipsHtml = '<ul class="list-disc list-inside space-y-1" id="tipsList">';
    (recipe.tips || []).forEach((tip) => { 
        tipsHtml += `<li>${tip}</li>`; 
    });
    tipsHtml += '</ul>';
    
    const oldAddButtons = recipeContentDiv.querySelectorAll('.add-btn-container');
    oldAddButtons.forEach(btn => btn.remove());

    recipeContentDiv.innerHTML = `
        ${recipeDescriptionHtml}
        <h3 class="text-xl font-semibold mb-3 text-slate-800">Ingredientes:</h3>
        ${ingredientsHtml}
        <h3 class="text-xl font-semibold mt-6 mb-3 text-slate-800">Instruções:</h3>
        ${instructionsHtml}
        <div class="dicas-jean p-4 mt-6 rounded-md">
            <h4 class="text-lg font-semibold mb-2 text-teal-800">Dicas:</h4>
            ${tipsHtml}
        </div>
        <div class="mt-8">
            <h4 class="text-lg font-semibold mb-2 text-slate-800">Minhas Anotações (para esta sessão):</h4>
            <textarea class="w-full h-32 p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Suas observações sobre o teste desta receita..."></textarea>
        </div>`;
}

function saveRecipeChangesInMemory(recipeObjectToUpdate) {
    if (!recipeObjectToUpdate) return;

    const descriptionTextarea = recipeContentDiv.querySelector('#recipeDescription textarea[data-field="description"]');
    if (descriptionTextarea) recipeObjectToUpdate.description = descriptionTextarea.value;

    const newIngredientsData = {};
    recipeContentDiv.querySelectorAll('table[data-section-key]').forEach(table => {
        const sectionKey = table.dataset.sectionKey;
        newIngredientsData[sectionKey] = [];
        table.querySelectorAll('tbody tr').forEach(row => {
            if (row.cells.length < 3 || !row.cells[0].querySelector('input')) return; 
            
            const itemInput = row.cells[0].querySelector('input');
            const percentageInput = row.cells[1].querySelector('input');
            const weightInput = row.cells[2].querySelector('input');

            if (itemInput && percentageInput && weightInput) {
                 const percentageText = percentageInput.value.trim();
                 const originalIngDataArray = currentRecipeOriginalData?.ingredients[sectionKey];
                 let originalIngData = {};
                 if(originalIngDataArray) {
                     originalIngData = originalIngDataArray.find(ing => ing.item === itemInput.value.trim()) || {};
                 }
                
                newIngredientsData[sectionKey].push({
                    item: itemInput.value.trim(),
                    percentage: !isNaN(parseFloat(percentageText)) ? parseFloat(percentageText) : (percentageText === '-' || percentageText === '' ? null : percentageText),
                    weightOriginal: weightInput.value.trim(),
                    isBaseFlour: originalIngData.isBaseFlour,
                    isBaseFlourPart: originalIngData.isBaseFlourPart,
                    isPreFerment: originalIngData.isPreFerment,
                    preFermentFlourPercentage: originalIngData.preFermentFlourPercentage
                });
            }
        });
    });
    recipeObjectToUpdate.ingredients = newIngredientsData;
    
    const newInstructions = [];
    recipeContentDiv.querySelectorAll('#instructionsList li textarea').forEach(textarea => {
        newInstructions.push(textarea.value.trim());
    });
    recipeObjectToUpdate.instructions = newInstructions;

    const newTips = [];
    recipeContentDiv.querySelectorAll('#tipsList li textarea').forEach(textarea => {
        newTips.push(textarea.value.trim());
    });
    recipeObjectToUpdate.tips = newTips;
    
    const recipeIndex = recipes.findIndex(r => r.name === currentRecipeOriginalData.name && r.category === currentRecipeOriginalData.category); 
    if (recipeIndex !== -1) {
        recipes[recipeIndex] = JSON.parse(JSON.stringify(recipeObjectToUpdate)); 
    } else {
        console.warn("Não foi possível encontrar a receita original no array 'recipes' para atualização pelo nome. A atualização pode não ter sido refletida no array principal se o nome foi alterado.");
    }
}

function getIngredientSectionName(key) {
    switch (key) {
        case 'poolish': return 'Poolish (Pré-Fermento)';
        case 'biga': return 'Biga (Pré-Fermento)';
        case 'soaker': return 'Soaker (Grãos Hidratados)';
        case 'pateFermentee': return 'Pâte Fermentée (Massa Pré-Fermentada)';
        case 'levain': return 'Levain (Sourdough Starter)';
        case 'levainCenteio': return 'Levain de Centeio';
        case 'lievitoMadre': return 'Lievito Madre';
        case 'primoImpasto': return 'Primeiro Impasto (1ª Massa)';
        case 'secondoImpasto': return 'Segundo Impasto (2ª Massa)';
        case 'sourdoughCenteio': return 'Sourdough de Centeio';
        case 'massa': return 'Massa Base';
        case 'recheio': return 'Recheio';
        case 'recheioCobertura': return 'Recheio/Cobertura';
        case 'finalizacao': return 'Finalização';
        case 'finalDough': return 'Massa Final';
        case 'cobertura': return 'Cobertura';
        case 'coberturaOpcional': return 'Cobertura (Opcional)';
        default: 
            const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return name.includes('Submenu') ? name.replace('Submenu', ' (Técnicas)') : name;
    }
}

function updateIngredientWeights(recipeObject, originalTotalFlourWeight, baseFlourSectionKey = 'finalDough') {
    const totalFlourInputElement = document.getElementById(`totalFlourInput-${recipeObject.name.replace(/\s/g, '-')}`);
    if (!totalFlourInputElement) return;
    const newTotalFlourWeight = parseFloat(totalFlourInputElement.value);

    if (isNaN(newTotalFlourWeight) || newTotalFlourWeight <= 0) {
        alert("Por favor, insira um valor válido para o peso da farinha.");
        return;
    }
    
    const scaleFactor = originalTotalFlourWeight > 0 ? newTotalFlourWeight / originalTotalFlourWeight : 1;

    Object.keys(recipeObject.ingredients).forEach(sectionKey => {
        const table = recipeContentDiv.querySelector(`table[data-section-key="${sectionKey}"]`);
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if(!tbody) return;

        recipeObject.ingredients[sectionKey].forEach((ingredientData, index) => {
            const row = tbody.rows[index];
            if (!row || row.cells.length < 3) return;

            const weightCellOrInput = isEditMode ? row.cells[2].querySelector('input') : row.cells[2];
            
            if (ingredientData.percentage !== null && ingredientData.percentage !== undefined && !isNaN(parseFloat(ingredientData.percentage))) {
                let calculatedWeight;
                const currentPercentage = parseFloat(ingredientData.percentage);

                if (sectionKey === baseFlourSectionKey) { 
                    if (ingredientData.isBaseFlourPart) { 
                        calculatedWeight = (currentPercentage / 100) * newTotalFlourWeight;
                    } else if (ingredientData.isBaseFlour) { 
                        calculatedWeight = newTotalFlourWeight; 
                    } else { 
                        calculatedWeight = (currentPercentage / 100) * newTotalFlourWeight;
                    }
                } else if (ingredientData.isPreFerment && ingredientData.preFermentFlourPercentage !== undefined && ingredientData.preFermentFlourPercentage > 0) {
                    const preFermentBaseFlourWeight = (ingredientData.preFermentFlourPercentage / 100) * newTotalFlourWeight;
                     calculatedWeight = (currentPercentage / 100) * preFermentBaseFlourWeight;
                } else { 
                    calculatedWeight = (currentPercentage / 100) * newTotalFlourWeight;
                }
                const newWeightString = calculatedWeight.toFixed(1) + 'g';
                if (isEditMode && weightCellOrInput) { weightCellOrInput.value = newWeightString; } 
                else if (weightCellOrInput) { weightCellOrInput.textContent = newWeightString; }
                ingredientData.weightOriginal = newWeightString; 

            } else { 
                const originalWeightMatch = String(ingredientData.weightOriginal).match(/(\d+(\.\d+)?)/);
                if (originalWeightMatch && !isNaN(parseFloat(originalWeightMatch[0])) && (ingredientData.item && !ingredientData.item.toLowerCase().includes("a gosto") && !ingredientData.item.toLowerCase().includes("unidade")) ) {
                    const scaledWeight = parseFloat(originalWeightMatch[0]) * scaleFactor;
                    let unit = String(ingredientData.weightOriginal).replace(originalWeightMatch[0], '').trim() || 'g';
                    if (unit.toLowerCase() === "ml" && (ingredientData.item.toLowerCase().includes("água") || ingredientData.item.toLowerCase().includes("leite"))) unit = "g"; 
                    
                    const newWeightString = scaledWeight.toFixed(1) + unit;
                    if (isEditMode && weightCellOrInput) { weightCellOrInput.value = newWeightString; } 
                    else if (weightCellOrInput) { weightCellOrInput.textContent = newWeightString; }
                    ingredientData.weightOriginal = newWeightString;
                } else {
                    if (isEditMode && weightCellOrInput) { weightCellOrInput.value = ingredientData.weightOriginal || ingredientData.weight || '-'; } 
                    else if (weightCellOrInput) { weightCellOrInput.textContent = ingredientData.weightOriginal || ingredientData.weight || '-'; }
                }
            }
        });
    });
}

function displayPageContent(htmlContent) {
    recipeContentDiv.innerHTML = htmlContent;
    printRecipeButton.style.display = 'none';
    editRecipeButton.style.display = 'none';
    saveRecipeChangesButton.style.display = 'none';
    cancelEditButton.style.display = 'none';
    flourCalculatorContainer.innerHTML = ''; 
    flourCalculatorContainer.style.display = 'none';
    restoreDefaultRecipesButton.style.display = 'none';
}

function populateNav() {
    recipeNav.innerHTML = ''; 
    const categories = {
        basicos: [], buffet: [], franceses: [], avancados: [],
        cremes_recheios: [], 
        fermentacao_submenu: []
    };
    
    defaultCreamsAndFillingsData.forEach(item => categories.cremes_recheios.push(item));
    defaultFermentationSubmenuData.forEach(item => categories.fermentacao_submenu.push(item));

    recipes.forEach(recipe => {
        if (recipe.type !== 'page') { 
             if (!categories[recipe.category]) {
                // console.warn(`Categoria '${recipe.category}' para a receita '${recipe.name}' não existe na estrutura 'categories'. A receita não será adicionada ao menu.`);
             } else {
                categories[recipe.category].push(recipe);
             }
        }
    });

    const categoryOrder = ['basicos', 'buffet', 'franceses', 'avancados', 'cremes_recheios', 'fermentacao_submenu']; 

    categoryOrder.forEach(categoryKey => {
        const categoryItems = categories[categoryKey];
        if (categoryItems && categoryItems.length > 0) {
            const categoryContainer = document.createElement('div');
            categoryContainer.classList.add('mb-1'); 
            
            const categoryButton = document.createElement('button');
            categoryButton.classList.add('nav-category-button');
            let categoryName = getIngredientSectionName(categoryKey);
             if(categoryKey === 'basicos') categoryName = 'Pães Básicos';
            else if(categoryKey === 'buffet') categoryName = 'Pães para Buffets';
            else if(categoryKey === 'franceses') categoryName = 'Pães Franceses';
            else if(categoryKey === 'avancados') categoryName = 'Pães Avançados';
            else if(categoryKey === 'cremes_recheios') categoryName = 'Cremes e Recheios';
            else if(categoryKey === 'fermentacao_submenu') categoryName = 'Técnicas de Fermentação';

            categoryButton.innerHTML = `
                <span>${categoryName}</span>
                <svg class="transform" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
            `;
            
            const subMenu = document.createElement('div');
            subMenu.classList.add('nav-submenu');

            categoryItems.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => { 
                const navLink = document.createElement('a');
                navLink.href = '#';
                navLink.textContent = item.name;
                navLink.classList.add('nav-item', 'block');
                navLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('#recipeNav .nav-item, #recipeNav .nav-page-button').forEach(el => el.classList.remove('active'));
                    document.querySelectorAll('#recipeNav .nav-category-button').forEach(btn => btn.classList.remove('active-category', 'open'));
                    document.querySelectorAll('#recipeNav .nav-submenu').forEach(sub => sub.classList.remove('open'));
                    
                    navLink.classList.add('active');
                    categoryButton.classList.add('active-category','open');
                    subMenu.classList.add('open');

                    if (item.type === 'page') { 
                        displayPageContent(pageContents[item.contentKey] || `<h2 class="page-title">${item.name}</h2><p>${item.description || 'Conteúdo em breve.'}</p>`);
                    } else {
                        const fullRecipeData = recipes.find(r => r.name === item.name && r.category === item.category && r.type !== 'page');
                        displayRecipeDetail(fullRecipeData || item); 
                    }
                     if (window.innerWidth <= 768) {
                        sidebar.classList.remove('open');
                        contentOverlay.classList.remove('open');
                    }
                });
                subMenu.appendChild(navLink);
            });

            categoryButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const currentlyOpenSubmenu = recipeNav.querySelector('.nav-submenu.open');
                const currentlyOpenButton = recipeNav.querySelector('.nav-category-button.open');

                if (currentlyOpenSubmenu && currentlyOpenSubmenu !== subMenu) {
                    currentlyOpenSubmenu.classList.remove('open');
                    if(currentlyOpenButton) currentlyOpenButton.classList.remove('open');
                }
                categoryButton.classList.toggle('open');
                subMenu.classList.toggle('open');
            });

            categoryContainer.appendChild(categoryButton);
            categoryContainer.appendChild(subMenu);
            recipeNav.appendChild(categoryContainer);
        }
    });
}

// Inicialização da Aplicação
initializeRecipes(); 
populateNav(); 

mobileMenuButton.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    contentOverlay.classList.toggle('open');
});
contentOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    contentOverlay.classList.remove('open');
});
printRecipeButton.addEventListener('click', () => {
    window.print();
});
