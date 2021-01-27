const eventBus = new Vue();

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true,
    },
  },
  template: `      
    <div class="product">
        <div class="product-image">
            <img :src="image" />
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock">In stock</p>
            <p v-else :class="{ outOfStock: !inStock }">Out of stock</p>

            <p v-if="onSale">{{printSaleText}}</p>

            <div
                v-for="(variant, index) in variant"
                :key="variant.variantId"
                class="color-box"
                :style="{ backgroundColor: variant.variantColor}"
                p
                @mouseover="updateProduct(index)"
            />
            
            <button
            v-on:click="addToCart"
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
                Add
            </button>
            
            <button
            v-on:click="removeFromCart"
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
                Remove
            </button>
        </div>

        <product-tabs :reviews="reviews" :premium="premium" :details="details"></product-tabs>

    </div>
  `,
  mounted() {
    eventBus.$on("review-submitted", (productReview) => {
      this.reviews.push(productReview);
    });
  },
  data() {
    return {
      brand: "Vue Mastery",
      product: "Socks",
      selectedVariant: 0,
      onSale: true,
      details: ["80% Cotton", "20% Polyester", "Gender-neutral"],
      variant: [
        {
          variantId: 1,
          variantColor: "Green",
          variantImage: "./assets/vmSocks-green-onWhite.jpg",
          variantQuantity: 10,
        },
        {
          variantId: 2,
          variantColor: "Blue",
          variantImage: "./assets/vmSocks-blue-onWhite.jpg",
          variantQuantity: 0,
        },
      ],
      reviews: [],
    };
  },
  methods: {
    addToCart: function () {
      this.$emit(
        "add-to-cart",
        this.variant[this.selectedVariant].variantId,
        "add"
      );
    },
    removeFromCart: function () {
      this.$emit(
        "remove-from-cart",
        this.variant[this.selectedVariant].variantId,
        "remove"
      );
    },
    updateProduct: function (index) {
      this.selectedVariant = index;
    },
  },
  computed: {
    title() {
      return `${this.brand} ${this.product}`;
    },
    image() {
      return this.variant[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variant[this.selectedVariant].variantQuantity;
    },
    printSaleText() {
      return `${this.brand} ${this.product} - on sale!`;
    },
  },
});

Vue.component("product-review", {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following errors</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>
        
        <p>
            <label for="review">Review:</label>      
            <textarea id="review" v-model="review"></textarea>
        </p>
        
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
            </select>
        </p>

        <p>
            Would you recommend this product?
        </p>
    
        <label for="recommend-yes">Yes</label>      
        <input id="recommend-yes" type="radio" v-model="recommend" value="true" />

        <label for="recommend-no">No</label>      
        <input id="recommend-no" type="radio" v-model="recommend" value="false" />
          

        <p>
            <input type="submit" value="Submit">  
        </p>    

    </form>
    `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: [],
    };
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating) {
        const productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend,
        };
        eventBus.$emit("review-submitted", productReview);
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null;
        this.errors = [];
      } else {
        if (!this.name) this.errors.push("Name is required");
        if (!this.review) this.errors.push("Review is required");
        if (!this.rating) this.errors.push("Rating is required");
        if (!this.recommend) this.errors.push("Recommendation is required");
      }
    },
  },
});

Vue.component("product-shipping", {
  props: {
    premium: {
      type: Boolean,
      required: true,
    },
  },
  template: `
  <p>Shipping: {{ shipping }}</p>
    `,
  computed: {
    shipping() {
      if (this.premium) {
        return "Free";
      }
      return 2.99;
    },
  },
});

Vue.component("product-details", {
  props: {
    details: {
      type: Array,
      required: true,
    },
  },
  template: `
        <ul>
            <li v-for="detail in details">
                {{ detail }}
            </li>
        </ul>
    `,
});

Vue.component("product-tabs", {
  props: {
    reviews: {
      type: Array,
      required: false,
    },
    details: {
      type: Array,
      required: false,
    },
    premium: {
      type: Boolean,
      required: true,
    },
  },
  template: `
    <div>    
        <div>
          <span class="tab" 
                v-for="(tab, index) in tabs" 
                @click="selectedTab = tab"
                :class="{ activeTab: selectedTab === tab }"
          >{{ tab }}</span>
        </div> 

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet</p>
            <ul>
                <li v-for="review in reviews">
                    <p>{{review.name}}</p>
                    <p>Rating: {{review.rating}}</p>
                    <p>{{review.review}}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
            <product-review></product-review>
        </div>

        <div v-show="selectedTab === 'Shipping'">
            <product-shipping :premium="premium"></product-shipping>
        </div>

        <div v-show="selectedTab === 'Details'">
            <product-details :details="details"></product-details>
        </div>
    </div>
    `,
  data() {
    return {
      tabs: ["Reviews", "Make a Review", "Shipping", "Details"],
      selectedTab: "Reviews",
    };
  },
});

const app = new Vue({
  el: "#app",
  data: {
    premium: true,
    cart: [],
  },
  methods: {
    updateCart: function (id, action) {
      if (action === "add") {
        this.cart.push(id);
      } else {
        const itemIndex = this.cart.indexOf(id);
        this.cart.splice(itemIndex, 1);
      }
    },
  },
});
