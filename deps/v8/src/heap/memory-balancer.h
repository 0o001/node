// Copyright 2023 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_HEAP_MEMORY_BALANCER_H_
#define V8_HEAP_MEMORY_BALANCER_H_

#include "src/tasks/cancelable-task.h"

namespace v8 {
namespace internal {

class Heap;

// The class that implements memory balancing.
// Listen to allocation/garbage collection events
// and smooth them using an exponentially weighted moving average (EWMA).
// Spawn a heartbeat task that monitors allocation rate.
// Calculate heap limit and update it accordingly.
class MemoryBalancer {
 public:
  constexpr static int kSecondsToNanoseconds = 1e9;
  constexpr static int kMillisecondsToNanoseconds = 1e6;

  explicit MemoryBalancer(Heap* heap) : heap_(heap) {}

  void TracerUpdate(size_t live_memory, double major_allocation_bytes,
                    double major_allocation_duration, double major_gc_bytes,
                    double major_gc_duration);

  void HeartbeatUpdate();

  void UpdateExternalAllocationLimit(size_t external_allocation_limit) {
    external_allocation_limit_ = external_allocation_limit;
  }

  void NotifyGC();

 private:
  struct SmoothedBytesAndDuration {
    void Update(double bytes, double duration, double decay_rate) {
      this->bytes = this->bytes * decay_rate + bytes * (1 - decay_rate);
      this->duration =
          this->duration * decay_rate + duration * (1 - decay_rate);
    }
    // Return memory (in bytes) over time (in nanoseconds).
    double rate() const { return bytes / duration; }

    double bytes;
    double duration;
  };

  static constexpr double kMajorAllocationDecayRate = 0.95;
  static constexpr double kMajorGCDecayRate = 0.5;

  void RefreshLimit();
  void PostHeartbeatTask();
  // Also touch global allocation limit
  void UpdateHeapLimit(size_t new_limit);

  void UpdateLiveMemory(size_t live_memory);
  void UpdateMajorAllocation(double major_allocation_bytes,
                             double major_allocation_duration);
  void UpdateMajorGC(double major_gc_bytes, double major_gc_duration);

  Heap* heap_;

  // Live memory estimate of the heap, obtained at the last major garbage
  // collection.
  size_t live_memory_after_gc_ = 0;

  // We want to set the old_generation_allocation_limit our way,
  // but when we do so we are taking memory from the external heap,
  // because the global allocation limit is shared between old generation and
  // external heap. We thus calculate the external heap limit and keep it
  // unchanged, by 'patching' the global_allocation_limit_.
  // A more principled solution is to also manage the external heapusing
  // membalancer. We can also replace global_allocation_limit_ in heap.cc with
  // external_allocation_limit_. Then we can recover global_allocation_limit_
  // via old_generation_allocation_limit_ + external_allocation_limit_.
  size_t external_allocation_limit_ = 0;

  // Our estimate of major allocation rate and major GC speed.
  base::Optional<SmoothedBytesAndDuration> major_allocation_rate_;
  base::Optional<SmoothedBytesAndDuration> major_gc_speed_;

  // HeartbeatTask uses the diff between last observed time/memory and
  // current time/memory to calculate the allocation rate.
  base::Optional<double> last_measured_memory_ = 0;
  base::Optional<size_t> last_measured_at_ = 0;
  bool heartbeat_task_started_ = false;
};

class HeartbeatTask : public CancelableTask {
 public:
  explicit HeartbeatTask(Isolate* isolate, MemoryBalancer* mb);

  ~HeartbeatTask() override = default;
  HeartbeatTask(const HeartbeatTask&) = delete;
  HeartbeatTask& operator=(const HeartbeatTask&) = delete;

 private:
  // v8::internal::CancelableTask overrides.
  void RunInternal() override;

  MemoryBalancer* mb_;
};

}  // namespace internal
}  // namespace v8

#endif  // V8_HEAP_MEMORY_BALANCER_H_
