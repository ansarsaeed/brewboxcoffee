/**
 * PARAMETERS
 *  - $planPicker: (required) the element to be used as the plan picker
 *  - overrides: (optional) override certain values
 * 
 * OVERRIDES
 *  - getVariantId: function
 * 
 * EVENTS
 *  - chargezen:plan-picker:loaded - (window) when chargezen script is loaded
 *  - chargezen:plan-picker:init - ($planPicker) when chargezen instance is initialized
 *  - chargezen:plan-picker:updated - ($planPicker) when chargezen instance is updated
 */

 (() => {
  if (window.chargezenPlanPicker) return Error('chargezen: chargezen already loaded');

  // chargezen Instances
  window.chargezenPlanPickerInstances = [];

  window.chargezenPlanPicker = ({ $planPicker, overrides = {} } = {}) => {
    try {
      const chargezen = {};

      // Log level
      chargezen.logLevel = 'info'; // set to error after setup
      const logLevels = { info: 1, warn: 2, error: 3 };

      function assert(condition, message, { messageType = 'error', exit = false, docsLink }) {
        if (!condition) {
          const formattedMessage = 'chargezen' + (chargezen.key ? `-${chargezen.key}` : '') + ': ' + message + 
            (docsLink ? `\n\nCheck out ${docsLink}` : ''); 
          if (exit) throw Error(formattedMessage);
          if (!console[messageType]) messageType = 'error';
          if (logLevels[messageType] >= logLevels[chargezen.logLevel])
            console[messageType](formattedMessage);
          return true;
        }
        return false;
      }

      assert($planPicker, 'No $planPicker provided', { exit: true });
      chargezen.$planPicker = $planPicker;
  
      // KEY
      chargezen.key = $planPicker.getAttribute('chargezen-plan-picker');
      const keyCount = document.querySelectorAll(`[chargezen-plan-picker="${chargezen.key}"]`).length;
      assert(
        keyCount === 1,
        `Key needs to be unique, key: '${chargezen.key}' used ${keyCount} times`,
        { exit: true }
      );

      // DISCOUNT FORMAT	
      chargezen.discountFormat = $planPicker.getAttribute('chargezen-discount-format');	
      assert(	
        chargezen.discountFormat === 'percent' || chargezen.discountFormat === 'absolute', 	
        'Invalid discount format', 	
        { exit: true }	
      );

      // SELECTORS
      chargezen.selectors = {
        sellingPlanId: 'input[name="selling_plan"]',
        variantId: '[name="id"]',
        productJson: '[chargezen-product-json]',
        onetime: '[chargezen-one-time]',
        groupContainer: '[chargezen-group-container]',
        sellingPlanGroup: (id) => `[chargezen-selling-plan-group${id ? `="${id}"` : ''}]`,
        groupInput: `input[name="chargezen-group-${chargezen.key}"]`,
        sellingPlans: (id) => `[chargezen-selling-plans${id ? `="${id}"` : ''}]`,
        onetimePrice: '[chargezen-onetime-price]',
        subscriptionPrice: '[chargezen-subscription-price]',
        discount: '[chargezen-discount]',
        discountProperty: '[name="properties[Discount]"]',
        externalPrice: '[chargezen-external-price]',     
      };
  
      // FORM
      const $$sellingPlan = $planPicker.querySelectorAll(chargezen.selectors.sellingPlanId);
      assert($$sellingPlan.length !== 0, 'No selling plan input element found', { exit: true });
      assert($$sellingPlan.length === 1, 'More than 1 selling plan input element found', 
        { messageType: 'warn' });
      const $sellingPlan = $$sellingPlan[0];
      chargezen.formAttr = $sellingPlan.getAttribute('form');
  
      if (chargezen.formAttr) chargezen.form = document.getElementById(chargezen.formAttr);
      if (!chargezen.form) chargezen.form = $planPicker.closest('form[action*="/cart/add"]');
      assert(
        chargezen.form, 'Couldn\'t find form, either connect to a form or submit using javascript', 
        { messageType: 'warn' }
      );
  
      // PRODUCT
      if (overrides.product) chargezen.product = overrides.product;
      else {
        const $$productJson = $planPicker.querySelectorAll(chargezen.selectors.productJson);
        assert($$productJson.length > 0, 'No product json element found', { exit: true });
        assert($$productJson.length === 1, 'Multiple product json elements found', 
          { messageType: 'warn' });
        chargezen.product = JSON.parse($$productJson[0].innerHTML);
      }
      assert(chargezen.product, 'Product is required', { exit: true });

      chargezen.isSubscription = false
    
      
      // MAIN PRODUCT
      const urlPath = window.location.pathname.split('/');
      chargezen.mainProduct = $planPicker.hasAttribute('chargezen-main-product') && urlPath[urlPath.length - 1] === chargezen.product.handle;

      // VARIANT ID
      const validateVariantId = (variantId) => {
        try {
          const type = typeof variantId;
          const isNumber = type === 'number';
          assert(isNumber, `Variant id needs to be a number, got '${type}'`, { exit: true });
          const index = chargezen.product.variants.findIndex(variant => variant.id == variantId);
          const found = index !== -1;
          assert(found, `Variant with id '${variantId}' not found`, { exit: true });
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
      }
  
      const getVariantId = () => {
        try {
          // Override
          if (typeof overrides.getVariantId === 'function') {
            const variantId = overrides.getVariantId();
            assert(validateVariantId(variantId), `Invalid variant id '${variantId}'`, 
              { exit: true });
            chargezen.variantId = variantId;
            return variantId;
          }
          // Default
          if (chargezen.form) {
            const $variantId = chargezen.form.querySelector(chargezen.selectors.variantId);
            assert(
              $variantId, 
              `Can't find variant id element using selector '${chargezen.selectors.variantId}'`, 
              { exit: true }
            );
            const variantId = parseInt($variantId.value);
            assert(validateVariantId(variantId), `Invalid variant id '${variantId}'`, 
              { messageType: 'warn', exit: true });
            chargezen.variantId = variantId;
            return variantId;
          }
          assert(false, 'Failed to get variant id. No form and no getVariantId() override provided',
            { exit: true });
        } catch (err) {
          console.error(err);
          chargezen.variantId = null;
          return null;
        }
      }

      const getVariant = () => {
        const variantId = getVariantId();
        if (variantId === null) return null;
        const variant = chargezen.product.variants.find(variant => variant.id === variantId);
        chargezen.variant = variant;
        return variant;
      }

      // SELLING PLAN GROUPS
      const getAvailableSellingPlanGroupIds = () => {
        const variant = getVariant();
        const availableSellingPlanGroupIdsSet = new Set();
        variant.selling_plan_allocations.forEach(selling_plan_allocation => {
          const selling_plan_group_id = selling_plan_allocation.selling_plan_group_id;
          const selling_plan_group = chargezen.product.selling_plan_groups.find(
            selling_plan_group => selling_plan_group.id === selling_plan_group_id);
          if (selling_plan_group.name )
            availableSellingPlanGroupIdsSet.add(selling_plan_allocation.selling_plan_group_id);
        });
        const availableSellingPlanGroupIds = Array.from(availableSellingPlanGroupIdsSet);
        chargezen.availableSellingPlanGroupIds = availableSellingPlanGroupIds;
        return availableSellingPlanGroupIds;
      }
  
      chargezen.updateSellingPlanGroupAvailability = () => {
        try {
          const availableSellingPlanGroupIds = getAvailableSellingPlanGroupIds();
          assert(
            availableSellingPlanGroupIds !== null,
            'Issue getting available selling plan group ids',
            { exit: true }
          );
          const $$sellingPlanGroup = $planPicker.querySelectorAll(chargezen.selectors.sellingPlanGroup());
          let checkedNoLongerAvailable = false;
          $$sellingPlanGroup.forEach($sellingPlanGroup => {
            const sellingPlanGroupId = $sellingPlanGroup.getAttribute('chargezen-selling-plan-group');
            const isAvailable = availableSellingPlanGroupIds.includes(sellingPlanGroupId);
            $sellingPlanGroup.disabled = !isAvailable;
            const $groupContainer = $sellingPlanGroup.closest(chargezen.selectors.groupContainer);
            if (isAvailable) $groupContainer.classList.add('chargezen-group-container--available');
            else $groupContainer.classList.remove('chargezen-group-container--available');

            if ($sellingPlanGroup.checked && !isAvailable) {
              checkedNoLongerAvailable = true;
              $sellingPlanGroup.checked = false;
            }
          });

          if (checkedNoLongerAvailable) {
            const $onetime = $planPicker.querySelector(chargezen.selectors.onetime);
            if ($onetime && availableSellingPlanGroupIds.length === 0) 
              $onetime.checked = true;
            else {
              const $firstAvailableSellingPlanGroup = 
                $planPicker.querySelector(`${chargezen.selectors.sellingPlanGroup()}:not(:disabled)`);
              if ($firstAvailableSellingPlanGroup) $firstAvailableSellingPlanGroup.checked = true;
            }
          }

          chargezen.updateSellingPlan();
        } catch (err) {
          console.error(err);
        }
      }

      const getSelectedSellingPlanGroupId = () => {
        try {
          $planPicker.querySelectorAll(chargezen.selectors.groupInput).forEach(el => 
            el.closest(chargezen.selectors.groupContainer).classList
            .remove('chargezen-group-container--selected'));
          const $onetime = $planPicker.querySelector(chargezen.selectors.onetime);
          if ($onetime?.checked) {
            $onetime.closest(chargezen.selectors.groupContainer).classList
              .add('chargezen-group-container--selected');
            chargezen.selectedSellingPlanGroupId = null;
            return null;
          }
          const $selectedSellingPlanGroup = $planPicker.querySelector(
            `${chargezen.selectors.sellingPlanGroup()}:checked`);
          if (
            assert($selectedSellingPlanGroup, 'No selected selling plan group', { messageType: 'warn' })
          ) return null;
          $selectedSellingPlanGroup.closest(chargezen.selectors.groupContainer).classList
            .add('chargezen-group-container--selected');
          const selectedSellingPlanGroupId =
            $selectedSellingPlanGroup.getAttribute('chargezen-selling-plan-group');
          assert(selectedSellingPlanGroupId, 'No selected selling plan group id', { exit: true });
          chargezen.selectedSellingPlanGroupId = selectedSellingPlanGroupId;
          return selectedSellingPlanGroupId;
        } catch (err) {
          console.error(err);
          chargezen.selectedSellingPlanGroupId = null;
          return null;
        }
      }

      // SELLING PLAN
      const validateSellingPlanId = (sellingPlanId) => {
        try {
          const type = typeof sellingPlanId;
          const isNumber = type === 'number'
          assert(isNumber, `Selling plan id needs to be a number, got '${type}'`, { exit: true });
          const variant = getVariant();
          const index = variant.selling_plan_allocations.findIndex(selling_plan_allocation => 
            selling_plan_allocation.selling_plan_id === sellingPlanId);
          const found = index !== -1;
          assert(found, `Selling plan with id ${sellingPlanId} not found`, { exit: true });
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
      };

      const updateUrlParam = (sellingPlanId) => {
        if (sellingPlanId !== '' && !validateSellingPlanId(sellingPlanId)) sellingPlanId = '';
        const url = new URL(window.location.href);
        if (sellingPlanId === "") url.searchParams.delete('selling_plan');
        else url.searchParams.set("selling_plan", sellingPlanId);
        window.history.replaceState({}, '', url.href);
      }

      chargezen.updateSellingPlan = () => {
        try {
          const $sellingPlan = $planPicker.querySelector(chargezen.selectors.sellingPlanId);
          assert($sellingPlan, 'Couldn\'t find selling plan element', { exit: true });
          
          const sellingPlanGroupId = getSelectedSellingPlanGroupId();
          
          let sellingPlanId;
          let sellingPlanName;
          if (!sellingPlanGroupId) sellingPlanId = '', sellingPlanName = '';
          else {
            const $sellingPlans = $planPicker.querySelector(
              chargezen.selectors.sellingPlans(sellingPlanGroupId));
            assert($sellingPlans, 'Couldn\'t find selling plans element', { exit: true });
            sellingPlanId = parseInt($sellingPlans.value);
            sellingPlanName = $sellingPlans.options[$sellingPlans.selectedIndex].text
            assert(validateSellingPlanId(sellingPlanId), 'Invalid selling plan id', { exit: true });

            if ($planPicker.querySelectorAll(chargezen.selectors.sellingPlans()).length > 1) {
              $planPicker.querySelectorAll(chargezen.selectors.sellingPlans()).forEach((selector) => {
                let option = Array.from(selector.options).find(option => option.text == sellingPlanName);
                if (option) selector.value = option.value
              });
            }
            
          }
  
          chargezen.sellingPlanId = sellingPlanId;
          $sellingPlan.value = sellingPlanId;
          if (chargezen.mainProduct) updateUrlParam(sellingPlanId);
          updateDiscounts();
          updatePrices();
          $planPicker.dispatchEvent(new CustomEvent('chargezen:plan-picker:update', { detail: { chargezen } }));
        } catch (err) {
          console.error(err);
        }
      }

      // MONEY
      chargezen.moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: window?.Shopify?.currency?.active || 'USD',
      });

      /**
       * Needs to run after updateSellingPlan()
       * The logic here should match the discount logic in chargezen-plan-picker.liquid
       */
      const updateDiscounts = () => {
        chargezen.availableSellingPlanGroupIds.forEach(availableSellingPlanGroupId => {	
          const $sellingPlanGroup = $planPicker.querySelector(	
            `${chargezen.selectors.sellingPlanGroup(availableSellingPlanGroupId)}`	
          );	
          if (assert($sellingPlanGroup, 
            `No selling group element found with id "${availableSellingPlanGroupId}"`, 	
            { messageType: 'info' })) return;	
          const $sellingPlans = $sellingPlanGroup.closest(chargezen.selectors.groupContainer)
            .querySelector(chargezen.selectors.sellingPlans());	
          if (assert($sellingPlans, 'No selling plans element found', 	
            { messageType: 'info' })) return;	
          const $$discount = $sellingPlanGroup	
            .parentElement.querySelectorAll(chargezen.selectors.discount);	
          if ($$discount.length === 0) return;
          const selling_plan_group = chargezen.product.selling_plan_groups	
            .find(selling_plan_group => selling_plan_group.id === availableSellingPlanGroupId);	
          const selling_plan = selling_plan_group.selling_plans	
            .find(selling_plan => selling_plan.id === parseInt($sellingPlans.value));	
          const price_adjustment = selling_plan.price_adjustments[0];	
  	
          let current_discount_percent = 0;	
          let current_discount_absolute = 0;	
          switch (price_adjustment.value_type) {	
            case 'percentage':	
              current_discount_percent = price_adjustment.value;	
              current_discount_absolute = Math.round(chargezen.variant.price * price_adjustment.value / 100.0);	
              break;	
            case 'fixed_amount':	
              current_discount_percent = Math.round(price_adjustment.value * 1.0 / chargezen.variant.price * 100.0);	
              current_discount_absolute = price_adjustment.value;	
              break;	
            case 'price':	
              current_discount_percent = Math.round((chargezen.variant.price - price_adjustment.value) * 1.0 / chargezen.variant.price * 100.0);	
              current_discount_absolute = chargezen.variant.price - price_adjustment.value;	
              break;	
          }	
          let current_discount_text;	
          if (current_discount_percent == 0) current_discount_text = '';	
          else if (chargezen.discountFormat === 'percent')	
            current_discount_text = `${current_discount_percent}%`;	
          else current_discount_text = chargezen.moneyFormatter.format(current_discount_absolute / 100);	
  	
          $$discount.forEach(el => el.innerHTML = current_discount_text);	
        });

        const $discountProperty = $planPicker.querySelector(chargezen.selectors.discountProperty);	
        if ($discountProperty) {	
          const $onetime = $planPicker.querySelector(chargezen.selectors.onetime);
          const $selectedSellingPlanGroup = $planPicker	
            .querySelector(chargezen.selectors.sellingPlanGroup(chargezen.selectedSellingPlanGroupId));
          const $$discount = $selectedSellingPlanGroup
            .parentElement.querySelectorAll(chargezen.selectors.discount);	
          if ($onetime?.checked || $$discount.length === 0) {	
            $discountProperty.disabled = true;	
            $discountProperty.value = '';	
          } else {	
            $discountProperty.disabled = false;
            const $discount = $selectedSellingPlanGroup.parentElement.querySelector(
                chargezen.selectors.discount);
            if ($discount) $discountProperty.value = $discount.innerHTML;
          }	
        }
      }

      const updatePrices = () => {
        const $externalPrice = document.querySelector(chargezen.selectors.externalPrice);

        // Selling Plans	
        chargezen.availableSellingPlanGroupIds.forEach(availableSellingPlanGroupId => {	
          const $sellingPlanGroup = $planPicker.querySelector(	
            `${chargezen.selectors.sellingPlanGroup(availableSellingPlanGroupId)}`	
          );	
          if (assert($sellingPlanGroup, 
            `No selling group element found with id "${availableSellingPlanGroupId}"`, 	
            { messageType: 'info' })) return;	
          const $sellingPlans = $sellingPlanGroup.closest(chargezen.selectors.groupContainer)
            .querySelector(chargezen.selectors.sellingPlans());	
          if (assert($sellingPlans, 'No selling plans element found', 	
            { messageType: 'info' })) return;	
          const sellingPlan = chargezen.product.selling_plan_groups	
            .find(selling_plan_group => selling_plan_group.id === availableSellingPlanGroupId)	
            .selling_plans	
            .find(selling_plan => selling_plan.id === parseInt($sellingPlans.value));	
          const $subscriptionPrice = $sellingPlanGroup.parentElement
            .querySelector(chargezen.selectors.subscriptionPrice);	
          if (assert($subscriptionPrice, 'No price element found', 	
            { messageType: 'info' })) return;	
          const sellingPlanAllocation = chargezen.variant.selling_plan_allocations.find(
            selling_plan_allocation => selling_plan_allocation.selling_plan_id === sellingPlan.id)
          const price = chargezen.moneyFormatter.format(sellingPlanAllocation.price / 100);
          $subscriptionPrice.innerHTML = price
          $sellingPlanGroup.checked ? chargezen.isSubscription = true : chargezen.isSubscription = false
          if ($externalPrice && chargezen.isSubscription) {
            $externalPrice.innerHTML = '- ' + price
          }
        })	
        // One-time	
        const $onetimePrice = $planPicker.querySelector(chargezen.selectors.onetimePrice);
        const onetimePrice = chargezen.variant.price / 100;	
        const onetimePriceFormatted = chargezen.moneyFormatter.format(onetimePrice);
        if ($onetimePrice) $onetimePrice.innerHTML = onetimePriceFormatted;
        if ($externalPrice && !chargezen.isSubscription) $externalPrice.innerHTML = '- ' + onetimePriceFormatted;
      }

      chargezen.update = () => chargezen.updateSellingPlanGroupAvailability();
      chargezen.update();

      // LISTENERS
      $planPicker
        .querySelectorAll(chargezen.selectors.groupInput)
        .forEach(el => el.addEventListener('change', chargezen.updateSellingPlanGroupAvailability));
      
      $planPicker
        .querySelectorAll(chargezen.selectors.sellingPlans())
        .forEach((el) => {
          const handler = (e) => {
            const $sellingPlanGroup = e.currentTarget
              .closest(chargezen.selectors.groupContainer)
              .querySelector(chargezen.selectors.groupInput);
            if ($sellingPlanGroup.checked) chargezen.updateSellingPlan();
            else {
              $sellingPlanGroup.checked = true;
              chargezen.updateSellingPlan();
            }
          }
          el.addEventListener('change', handler);
          el.addEventListener('focus', handler);
        });
      
      chargezen.form
        .querySelector(chargezen.selectors.variantId)
        .addEventListener('change', chargezen.update);
        
        // .querySelectorAll(chargezen.selectors.variantId)
        // .forEach(el => el.addEventListener('DOMSubtreeModified', chargezen.update));

        // .querySelector('INPUT CONTAINER SELECTOR')
        // .addEventListener('click', () => setTimeout(chargezen.update, 0));

      // Create MutationObserver instance to watch for change of selected option value inside select element for variant IDs
      // chargezen.variantObserver = 
      //   new MutationObserver(function(mutationsList, observer) {
      //     for(const mutation of mutationsList) {
      //       if (mutation.type === 'attributes') chargezen.update();
      //     }
      //   }).observe(chargezen.form.querySelector(chargezen.selectors.variantId), { attributeFilter: ['selected'], subtree: true });
  
      // Fire init event
      $planPicker.dispatchEvent(new CustomEvent('chargezen:plan-picker:init', { detail: { chargezen } }));
      // Add to instances
      window.chargezenPlanPickerInstances.push(chargezen);
      // Attach to $planPicker
      $planPicker.chargezen = chargezen;

      return chargezen;
    } catch (err) {
      console.error(err);
    }
  };

  // Auto init
  window.chargezenPlanPickerAutoInit = () => {
    const $$autoInitPlanPicker = document.querySelectorAll(
      '[chargezen-plan-picker][chargezen-auto-init]'
    );
    $$autoInitPlanPicker.forEach($autoInitPlanPicker => {
      window.chargezenPlanPicker({ $planPicker: $autoInitPlanPicker });
    });
  }
  window.chargezenPlanPickerAutoInit();

  window.dispatchEvent(new CustomEvent('chargezen:plan-picker:loaded'));
})()
