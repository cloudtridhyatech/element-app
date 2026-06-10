<template>
  <div>
    <el-form ref="form1" :model="accommodationForm" :rules="rules">
      <el-row :gutter="64">
        <el-col :span="12">
          <el-row>
            <el-col :span="24">
              <el-form-item label="Accommodation Name" prop="accommodationName">
                <el-input
                  placeholder="Enter accommodation name"
                  v-model="accommodationForm.accommodationName"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="Tour Operator" prop="tourOperatorId">
                <el-select
                  v-model="accommodationForm.tourOperatorId"
                  clearable
                  filterable
                  placeholder="select tour operator"
                >
                  <el-option
                    v-for="tourOperator in allActiveTourOperators"
                    :key="tourOperator.id"
                    :label="tourOperator.name"
                    :value="tourOperator.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Location" prop="placeId">
                <el-select
                  v-model="accommodationForm.placeId"
                  clearable
                  filterable
                  placeholder="select location"
                >
                  <el-option
                    v-for="place in getPlacesList(accommodationForm.placeId)"
                    :key="place.id"
                    :label="place.name"
                    :value="place.id"
                    ><span
                      :style="place.active === false ? 'color:#DCDFE6' : ''"
                      >{{ place.name }}</span
                    >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Latitude" prop="latitude">
            <el-input-number
              :precision="5"
              :step="0.1"
              placeholder="Enter latitude"
              v-model.number="accommodationForm.latitude"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="Longitude" prop="longitude">
            <el-input-number
              :precision="5"
              :step="0.1"
              placeholder="Enter longitude"
              v-model.number="accommodationForm.longitude"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="64">
        <el-col :span="12">
          <p>
            Marking the accommodation as archived will not affect existing
            bookings but will prevent clients finding the accommodation when
            making a new booking.
          </p>
          <el-switch
            v-model="accommodationForm.active"
            active-text="Active"
            inactive-text="Archived"
          ></el-switch>
        </el-col>
        <el-col :span="12">
          <p v-if="accommodationForm.latitude && accommodationForm.longitude">
            <a v-bind:href="googleUrl" target="_new">Show in Google Maps</a>
          </p>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    accommodationForm: {
      required: true
    },
    allActiveTourOperators: {
      type: Array,
      required: true
    },
    allActivePlaces: {
      type: Array,
      required: true
    },
    allPlaces: {
      type: Array,
      required: true
    },
    isEditing: {
      required: true,
      type: Boolean
    }
  },

  computed: {
    googleUrl: function() {
      return "https://www.google.com/maps/search/?api=1&query="
        .concat(this.accommodationForm.latitude)
        .concat(",")
        .concat(this.accommodationForm.longitude);
    }
  },
  data() {
    return {
      formValid: false,
      rules: {
        accommodationName: [
          {
            required: true,
            message: "Please input accommodation name",
            trigger: "blur"
          },
          {
            min: 3,
            max: 50,
            message: "Length should be 3 to 50 characters",
            trigger: "blur"
          }
        ],
        latitude: [
          {
            type: "number",
            min: -90,
            max: 90,
            message: "Please use a number between -90 and +90 for latitude",
            trigger: "blur"
          }
        ],
        longitude: [
          {
            type: "number",
            min: -180,
            max: 180,
            message: "Please use a number between -180 and 180 for longitude",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    isValidForm() {
      this.$refs["form1"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },
    getPlacesList(id) {
      let reponse = this.allActivePlaces;

      if (this.isEditing === true && id) {
        //if place is still active , no need to show all places
        let place = this.findPlace(id);
        if (!place || place === null) {
          reponse = this.allPlaces;
        }
      }

      return reponse;
    },
    findPlace(placeId) {
      if (placeId && placeId !== null && placeId !== "") {
        return this.allActivePlaces.find(place => place.id === placeId);
      }
      return null;
    }
  }
};
</script>

<style lang="scss" scoped></style>
